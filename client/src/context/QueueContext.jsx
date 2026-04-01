import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useEffect } from 'react';
import { useSocket } from './SocketContext';
import * as api from '../services/api';

const useQueueStore = create(
  devtools(
    (set, get) => ({
      queue: [],
      currentToken: null,
      stats: null,
      loading: false,
      connected: false,
      error: null,

      setLoading: (loading) => set({ loading }),
      setConnected: (connected) => set({ connected }),
      setError: (error) => set({ error }),

      setQueue: (queue) => {
        const normalized = Array.isArray(queue) ? queue : [];
        const current = normalized.find((token) => token.status === 'in-progress') || null;
        set({ queue: normalized, currentToken: current });
      },

      setStats: (stats) => set({ stats: stats || null }),

      fetchQueue: async () => {
        set({ loading: true, error: null });
        try {
          const queue = await api.getQueue();
          get().setQueue(queue);
        } catch (error) {
          set({ error: error.message || 'Failed to fetch queue' });
        } finally {
          set({ loading: false });
        }
      },

      fetchStats: async () => {
        try {
          const stats = await api.getLiveStats();
          get().setStats(stats);
        } catch (error) {
          set({ error: error.message || 'Failed to fetch live stats' });
        }
      },

      refreshAll: async () => {
        await Promise.all([get().fetchQueue(), get().fetchStats()]);
      },

      createToken: async (payload) => {
        set({ loading: true, error: null });
        try {
          const token = await api.createToken(payload);
          await get().refreshAll();
          return token;
        } catch (error) {
          set({ error: error.message || 'Failed to create token' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      callNext: async () => {
        set({ loading: true, error: null });
        try {
          const token = await api.callNextPatient();
          await get().refreshAll();
          return token;
        } catch (error) {
          set({ error: error.message || 'Failed to call next patient' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      completeToken: async (tokenNumber) => {
        set({ loading: true, error: null });
        try {
          const token = await api.completeConsultation(tokenNumber);
          await get().refreshAll();
          return token;
        } catch (error) {
          set({ error: error.message || 'Failed to complete consultation' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'queue-store' }
  )
);

export const QueueProvider = ({ children }) => {
  const { socket, connected } = useSocket();

  useEffect(() => {
    useQueueStore.getState().setConnected(connected);
  }, [connected]);

  useEffect(() => {
    if (!socket) {
      useQueueStore.getState().refreshAll();
      return;
    }

    const onQueueUpdated = (payload) => {
      useQueueStore.getState().setQueue(payload);
    };

    const onAnyQueueMutation = () => {
      useQueueStore.getState().refreshAll();
    };

    socket.on('queue_updated', onQueueUpdated);
    socket.on('token_created', onAnyQueueMutation);
    socket.on('patient_called', onAnyQueueMutation);
    socket.on('consultation_complete', onAnyQueueMutation);
    socket.on('wait_time_updated', onAnyQueueMutation);

    useQueueStore.getState().refreshAll();

    const fallbackPoll = setInterval(() => {
      if (!socket.connected) {
        useQueueStore.getState().refreshAll();
      }
    }, 15000);

    return () => {
      socket.off('queue_updated', onQueueUpdated);
      socket.off('token_created', onAnyQueueMutation);
      socket.off('patient_called', onAnyQueueMutation);
      socket.off('consultation_complete', onAnyQueueMutation);
      socket.off('wait_time_updated', onAnyQueueMutation);
      clearInterval(fallbackPoll);
    };
  }, [socket]);

  return children;
};

export const useQueue = useQueueStore;

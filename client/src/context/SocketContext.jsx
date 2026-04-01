import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSocket } from '../services/socket';

const SocketContext = createContext(null);

const getRoomFromPath = (path) => {
  if (path.startsWith('/doctor')) return 'doctor-room';
  if (path.startsWith('/display')) return 'display-room';
  if (path.startsWith('/reception')) return 'reception-room';
  return 'queue-room';
};

export function SocketProvider({ children }) {
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('');

  useEffect(() => {
    const instance = getSocket();
    setSocket(instance);
    setConnected(instance.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    instance.on('connect', onConnect);
    instance.on('disconnect', onDisconnect);

    return () => {
      instance.off('connect', onConnect);
      instance.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const room = getRoomFromPath(location.pathname);
    if (room !== currentRoom) {
      socket.emit('join_room', room);
      setCurrentRoom(room);
    }
  }, [socket, location.pathname, currentRoom]);

  const value = useMemo(
    () => ({ socket, connected, currentRoom }),
    [socket, connected, currentRoom]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

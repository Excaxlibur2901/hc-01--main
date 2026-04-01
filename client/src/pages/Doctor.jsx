import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import QueueList from '../components/QueueList';
import ConsultationTimer from '../components/ConsultationTimer';
import StatsCard from '../components/StatsCard';
import { useQueue } from '../context/QueueContext';
import * as api from '../services/api';

export default function Doctor() {
  const pageRef = useRef(null);
  const { queue, callNext, completeToken, currentToken, stats, loading, connected } = useQueue();

  const [session, setSession] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [error, setError] = useState('');

  const waitingQueue = useMemo(
    () => queue.filter((token) => token.status === 'waiting'),
    [queue]
  );

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-gsap-doctor-header]', {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
      });

      gsap.from('[data-gsap-doctor-card]', {
        y: 24,
        opacity: 0,
        duration: 0.62,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.1,
      });
    }, pageRef);

    return () => ctx.revert();
  }, [session]);

  const refetchSession = useCallback(async () => {
    try {
      const activeSession = await api.getDoctorSession();
      setSession(activeSession || null);
    } catch (fetchError) {
      setSession(null);
      setError(fetchError.message || 'Failed to fetch doctor session.');
    }
  }, []);

  useEffect(() => {
    refetchSession();
  }, [refetchSession]);

  const handleStartSession = async () => {
    if (!doctorName.trim()) {
      setError('Doctor name is required.');
      return;
    }

    try {
      const started = await api.startDoctorSession({ doctorName: doctorName.trim() });
      setSession(started);
      setError('');
    } catch (startError) {
      setError(startError.message || 'Failed to start session.');
    }
  };

  const handleEndSession = async () => {
    try {
      await api.endDoctorSession();
      setSession(null);
      setError('');
    } catch (endError) {
      setError(endError.message || 'Failed to end session.');
    }
  };

  const handleCallNext = async () => {
    setError('');
    try {
      await callNext();
    } catch (callError) {
      setError(callError.message || 'No waiting patients.');
    }
  };

  const handleComplete = async () => {
    if (!currentToken) return;

    try {
      await completeToken(currentToken.tokenNumber);
      await refetchSession();
    } catch (completeError) {
      setError(completeError.message || 'Failed to complete consultation.');
    }
  };

  if (!session) {
    return (
      <section ref={pageRef} className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
        <h1 className="text-2xl font-black text-slate-900">Doctor Session</h1>
        <p className="mt-1 text-sm text-slate-600">Start session to manage queue operations.</p>

        <div className="mt-6 space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Doctor Name</span>
            <input
              type="text"
              className="input-field"
              value={doctorName}
              onChange={(event) => setDoctorName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleStartSession();
                }
              }}
            />
          </label>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button type="button" className="btn-primary w-full py-3" onClick={handleStartSession}>
            Start Session
          </button>
        </div>
      </section>
    );
  }

  return (
    <section ref={pageRef} className="space-y-6">
      <div data-gsap-doctor-header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Doctor Panel</h1>
          <p className="mt-1 text-sm text-slate-600">Dr. {session.doctorName}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {connected ? 'Live' : 'Offline'}
          </div>
          <button type="button" onClick={handleEndSession} className="btn-outline py-2 text-sm">
            End Session
          </button>
        </div>
      </div>

      <div data-gsap-doctor-card className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard icon="Q" label="Waiting" value={waitingQueue.length} color="sky" />
        <StatsCard icon="P" label="In Progress" value={currentToken ? 1 : 0} color="emerald" />
        <StatsCard icon="H" label="Handled" value={session.tokensHandled ?? '--'} color="purple" />
        <StatsCard
          icon="A"
          label="Avg Consult"
          value={stats?.avgConsultTime !== undefined ? `${stats.avgConsultTime}m` : '--'}
          color="amber"
        />
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div data-gsap-doctor-card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          <h2 className="text-xl font-bold text-slate-900">Now Serving</h2>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-4xl font-black text-slate-900">
              {currentToken ? `A${String(currentToken.tokenNumber).padStart(3, '0')}` : '--'}
            </p>
            <p className="mt-2 text-sm text-slate-600">{currentToken?.patientName || 'No active patient'}</p>
            {currentToken?.priority ? (
              <span className="mt-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {currentToken.priority}
              </span>
            ) : null}
          </div>

          <ConsultationTimer
            isActive={Boolean(currentToken)}
            startTime={currentToken?.calledAt}
            onComplete={currentToken ? handleComplete : undefined}
          />

          <button
            type="button"
            onClick={handleCallNext}
            disabled={loading || waitingQueue.length === 0}
            className="btn-primary mt-4 w-full py-4 text-base font-bold disabled:opacity-50"
          >
            {loading ? 'Processing...' : waitingQueue.length === 0 ? 'No waiting patients' : 'Call Next Patient'}
          </button>
        </div>

        <div data-gsap-doctor-card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          <h2 className="text-xl font-bold text-slate-900">Waiting Queue</h2>
          <div className="mt-4">
            <QueueList queue={waitingQueue} />
          </div>
        </div>
      </div>
    </section>
  );
}

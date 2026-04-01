import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import QueueList from '../components/QueueList';
import { useQueue } from '../context/QueueContext';

export default function Display() {
  const displayRef = useRef(null);
  const tokenRef = useRef(null);

  const { queue, currentToken, stats, connected } = useQueue();
  const [now, setNow] = useState(new Date());

  const waitingQueue = useMemo(
    () => queue.filter((token) => token.status === 'waiting'),
    [queue]
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!displayRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-gsap-display-header]', {
        y: -20,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
      });

      gsap.from('[data-gsap-display-card]', {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.12,
      });
    }, displayRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!tokenRef.current) return;

    gsap.fromTo(
      tokenRef.current,
      { scale: 0.92, opacity: 0.4 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
  }, [currentToken?.tokenNumber]);

  return (
    <section ref={displayRef} className="fixed inset-0 overflow-auto bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white">
      <header
        data-gsap-display-header
        className="flex items-center justify-between border-b border-white/10 bg-black/20 px-8 py-4 backdrop-blur"
      >
        <h1 className="text-xl font-black tracking-wide">Hospital OPD Live Queue</h1>
        <div className="flex items-center gap-6">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {connected ? 'LIVE' : 'OFFLINE'}
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold">{now.toLocaleTimeString()}</p>
            <p className="text-xs text-white/60">{now.toLocaleDateString()}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 p-8 lg:grid-cols-12">
        <div data-gsap-display-card className="lg:col-span-5 rounded-2xl border border-white/20 bg-white/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Now Serving</p>
          <div ref={tokenRef} className="mt-5 text-center">
            <p className="text-[5.5rem] font-black leading-none text-cyan-300 md:text-[8rem]">
              {currentToken ? `A${String(currentToken.tokenNumber).padStart(3, '0')}` : '--'}
            </p>
            <p className="mt-3 text-lg text-white/80">{currentToken?.patientName || 'Waiting for next call'}</p>
            <p className="mt-2 text-sm uppercase tracking-widest text-white/60">
              {currentToken?.priority || 'No active priority'}
            </p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <div data-gsap-display-card className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-lg font-bold text-white/80">Next Up</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {waitingQueue.slice(0, 6).map((token) => (
                <div key={token._id} className="rounded-xl border border-white/15 bg-black/20 p-4 text-center">
                  <p className="text-3xl font-black text-white">A{String(token.tokenNumber).padStart(3, '0')}</p>
                  <p className="mt-1 truncate text-sm text-white/70">{token.patientName}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/50">{token.priority}</p>
                  <p className="mt-1 text-xs text-white/50">{token.estimatedWaitTime} min</p>
                </div>
              ))}
              {waitingQueue.length === 0 ? (
                <p className="col-span-full rounded-xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/60">
                  No waiting tokens
                </p>
              ) : null}
            </div>
          </div>

          <div data-gsap-display-card className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-sky-300/20 bg-sky-500/10 p-4 text-center">
              <p className="text-2xl font-black">{stats?.waiting ?? waitingQueue.length}</p>
              <p className="text-xs uppercase tracking-wider text-white/60">Waiting</p>
            </div>
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-center">
              <p className="text-2xl font-black">{stats?.completed ?? '--'}</p>
              <p className="text-xs uppercase tracking-wider text-white/60">Completed</p>
            </div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-500/10 p-4 text-center">
              <p className="text-2xl font-black">{stats?.avgConsultTime !== undefined ? `${stats.avgConsultTime}m` : '--'}</p>
              <p className="text-xs uppercase tracking-wider text-white/60">Avg Consult</p>
            </div>
            <div className="rounded-xl border border-violet-300/20 bg-violet-500/10 p-4 text-center">
              <p className="text-2xl font-black">{stats?.totalTokens ?? queue.length}</p>
              <p className="text-xs uppercase tracking-wider text-white/60">Total</p>
            </div>
          </div>

          <div data-gsap-display-card className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-lg font-bold text-white/80">Full Waiting Queue</h2>
            <div className="mt-4">
              <QueueList queue={waitingQueue} displayMode />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

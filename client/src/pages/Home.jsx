import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useQueue } from '../context/QueueContext';

const panelItems = [
  {
    path: '/reception',
    title: 'Reception Panel',
    description: 'Register patients and issue tokens directly to the live queue.',
  },
  {
    path: '/doctor',
    title: 'Doctor Panel',
    description: 'Call next patients and complete consultations in real time.',
  },
  {
    path: '/display',
    title: 'Display Board',
    description: 'Show current serving token and next-up queue for waiting area.',
  },
  {
    path: '/emergency',
    title: 'Emergency Redirect',
    description: 'Find best nearby hospital recommendations and confirm selections.',
  },
];

export default function Home() {
  const pageRef = useRef(null);
  const { stats, queue, connected } = useQueue();

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-gsap-hero]', {
        y: 18,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from('[data-gsap-stat]', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        delay: 0.15,
      });

      gsap.from('[data-gsap-panel]', {
        y: 26,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.22,
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const metrics = [
    { label: 'Total Tokens Today', value: stats?.totalTokens ?? '--' },
    { label: 'Waiting', value: stats?.waiting ?? '--' },
    { label: 'In Progress', value: stats?.inProgress ?? '--' },
    { label: 'Completed', value: stats?.completed ?? '--' },
    { label: 'Emergency Cases', value: stats?.emergencies ?? '--' },
    {
      label: 'Average Consultation',
      value: stats?.avgConsultTime !== undefined ? `${stats.avgConsultTime}m` : '--',
    },
  ];

  return (
    <section ref={pageRef} className="space-y-8">
      <div
        data-gsap-hero
        className="rounded-3xl border border-slate-200/70 bg-gradient-to-r from-white via-cyan-50 to-blue-100/80 p-8 shadow-xl shadow-slate-200/50"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Backend Connected Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">Hospital OPD Queue Frontend</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
          Frontend is now mapped to real backend use cases in <code>usecases.md</code> and listens to live MongoDB-backed queue updates via Socket.IO.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {connected ? 'Socket connected' : 'Socket disconnected'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            data-gsap-stat
            className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-lg shadow-slate-200/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {panelItems.map((panel) => (
          <Link
            key={panel.path}
            data-gsap-panel
            to={panel.path}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <h2 className="text-xl font-black text-slate-900 transition-colors group-hover:text-cyan-700">{panel.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{panel.description}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 text-sm text-slate-600">
        Queue records currently loaded from backend: <span className="font-bold text-slate-900">{queue.length}</span>
      </div>
    </section>
  );
}

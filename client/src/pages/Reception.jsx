import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useQueue } from '../context/QueueContext';
import StatsCard from '../components/StatsCard';
import QueueList from '../components/QueueList';

const priorities = [
  { value: 'general', label: 'General' },
  { value: 'senior', label: 'Senior' },
  { value: 'emergency', label: 'Emergency' },
];

export default function Reception() {
  const sectionRef = useRef(null);
  const { queue, createToken, stats, loading, connected } = useQueue();

  const [form, setForm] = useState({
    patientName: '',
    age: '',
    condition: '',
    priority: '',
  });
  const [error, setError] = useState('');
  const [lastToken, setLastToken] = useState(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-gsap-reception-header]', {
        y: 16,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
      });
      gsap.from('[data-gsap-reception-card]', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.12,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const waitingQueue = useMemo(
    () => queue.filter((token) => token.status === 'waiting'),
    [queue]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.patientName.trim()) {
      setError('Patient name is required.');
      return;
    }

    if (!form.priority) {
      setError('Please select a priority.');
      return;
    }

    try {
      const token = await createToken({
        patientName: form.patientName.trim(),
        age: form.age ? Number(form.age) : undefined,
        condition: form.condition.trim() || undefined,
        priority: form.priority,
      });

      setLastToken(token);
      setForm({ patientName: '', age: '', condition: '', priority: '' });
    } catch (submitError) {
      setError(submitError.message || 'Failed to create token.');
    }
  };

  return (
    <section ref={sectionRef} className="grid gap-8 lg:grid-cols-12">
      <div data-gsap-reception-header className="lg:col-span-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Reception Panel</h1>
          <p className="mt-1 text-sm text-slate-600">Create live queue entries directly in MongoDB.</p>
        </div>
        <div className={`rounded-full px-4 py-2 text-sm font-semibold ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      <div data-gsap-reception-card className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
        <h2 className="text-xl font-bold text-slate-900">Register Patient</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Patient Name</span>
              <input
                type="text"
                className="input-field"
                value={form.patientName}
                onChange={(event) => setForm((prev) => ({ ...prev, patientName: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Age</span>
              <input
                type="number"
                min="0"
                max="150"
                className="input-field"
                value={form.age}
                onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
              />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-sm font-semibold text-slate-700">Condition</span>
            <input
              type="text"
              className="input-field"
              value={form.condition}
              onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))}
            />
          </label>

          <div>
            <p className="text-sm font-semibold text-slate-700">Priority</p>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, priority: priority.value }))}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    form.priority === priority.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-bold">
            {loading ? 'Creating token...' : 'Create Token'}
          </button>
        </form>

        {lastToken ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Latest token</p>
            <p className="mt-2 text-2xl font-black text-emerald-800">A{String(lastToken.tokenNumber).padStart(3, '0')}</p>
            <p className="text-sm text-emerald-700">
              {lastToken.patientName} • {lastToken.priority}
            </p>
          </div>
        ) : null}
      </div>

      <div data-gsap-reception-card className="lg:col-span-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatsCard icon="Q" label="Waiting" value={stats?.waiting ?? waitingQueue.length} color="sky" />
          <StatsCard icon="D" label="Completed" value={stats?.completed ?? '--'} color="emerald" />
          <StatsCard icon="E" label="Emergency" value={stats?.emergencies ?? '--'} color="red" />
          <StatsCard icon="T" label="Total" value={stats?.totalTokens ?? queue.length} color="purple" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/40">
          <h3 className="text-lg font-bold text-slate-900">Waiting Queue</h3>
          <div className="mt-3">
            <QueueList queue={waitingQueue} />
          </div>
        </div>
      </div>
    </section>
  );
}

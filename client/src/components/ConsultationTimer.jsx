import { useState, useEffect, useRef } from 'react';

export default function ConsultationTimer({ isActive, startTime, onComplete }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && startTime) {
      const start = new Date(startTime).getTime();
      if (isNaN(start)) {
        console.warn('Invalid startTime:', startTime);
        return;
      }

      const tick = () => {
        const now = Date.now();
        setElapsed(Math.floor((now - start) / 1000));
      };

      tick();
      intervalRef.current = setInterval(tick, 1000);

      return () => clearInterval(intervalRef.current);
    } else {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isActive, startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Color changes based on duration
  const getTimerColor = () => {
    if (minutes >= 20) return 'text-red-500';
    if (minutes >= 15) return 'text-amber-500';
    return 'text-emerald-500';
  };

  if (!isActive) {
    return (
      <div className="text-center py-6">
        <p className="text-4xl font-mono font-bold text-slate-300">00:00</p>
        <p className="text-sm text-slate-400 mt-2">No active consultation</p>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Consultation Time</p>
      <p className={`text-5xl md:text-6xl font-mono font-black ${getTimerColor()} transition-colors duration-500`}>
        {formatted}
      </p>
      <p className="text-sm text-slate-400 mt-3">
        {minutes < 10 ? '🟢 Normal pace' : minutes < 15 ? '🟡 Getting long' : '🔴 Exceeding avg time'}
      </p>
      {onComplete && (
        <button onClick={onComplete} className="mt-4 btn-success text-sm">
          ✓ Complete Consultation
        </button>
      )}
    </div>
  );
}

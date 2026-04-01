import { useState, useEffect, useCallback } from 'react';
import { formatDuration } from '../utils/format';

export function useTimer(startTime, isActive) {
  const [elapsed, setElapsed] = useState(0);

  const getColorClass = (seconds) => {
    const min = Math.floor(seconds / 60);
    if (min >= 20) return 'text-red-500 ring-red-400/30';
    if (min >= 15) return 'text-amber-500 ring-amber-400/30';
    return 'text-emerald-500 ring-emerald-400/30';
  };

  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsed(0);
      return;
    }

    const start = new Date(startTime).getTime();
    if (isNaN(start)) return;

    const tick = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatted = formatDuration(elapsed);
  const colorClass = getColorClass(elapsed);

  return { elapsed, formatted, colorClass };
}


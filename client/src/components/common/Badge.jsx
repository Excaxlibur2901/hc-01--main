import clsx from 'clsx';
import { PRIORITIES } from '../../utils/constants';

const getBadgeStyle = (priority) => {
  const p = PRIORITIES.find(pr => pr.value === priority);
  if (!p) return 'bg-slate-100 text-slate-800';
  const colors = {
    sky: 'bg-sky-100 text-sky-800 border-sky-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };
  return clsx('px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-sm', colors[p.color] || colors.sky);
};

export default function Badge({ children, priority, className = '' }) {
  const content = priority ? PRIORITIES.find(p => p.value === priority)?.label : children;
  return <span className={clsx(getBadgeStyle(priority), className)}>{content}</span>;
}


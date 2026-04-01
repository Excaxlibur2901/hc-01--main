import clsx from 'clsx';

export default function Spinner({ size = 'md', color = 'sky', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const colorClasses = {
    sky: 'border-sky-500 border-t-sky-200',
    red: 'border-red-500 border-t-red-200',
    emerald: 'border-emerald-500 border-t-emerald-200',
  };

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-transparent', sizeClasses[size], colorClasses[color], className)} />
  );
}


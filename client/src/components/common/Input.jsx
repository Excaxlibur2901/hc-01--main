import clsx from 'clsx';

export default function Input({ label, icon: Icon, className = '', error, ...props }) {
  return (
    <div className="space-y-2">
      {label ? <label className="block text-sm font-semibold text-slate-700">{label}</label> : null}
      <div className="relative">
        {Icon ? <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
        <input
          className={clsx(
            'w-full rounded-xl border-2 bg-white/80 py-3 pr-4 text-slate-900 font-medium shadow-sm transition-all duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:shadow-lg hover:border-slate-300 hover:shadow-md',
            Icon ? 'pl-10' : 'pl-4',
            className
          )}
          {...props}
        />
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

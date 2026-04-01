import clsx from 'clsx';

const variantStyles = {
  default: 'glass-card bg-white/80 border-slate-200/50',
  dark: 'glass-card-dark bg-white/5 border-white/10 text-white',
  elevated: 'glass-card bg-white/90 shadow-xl shadow-slate-200/50 border-slate-100/50 hover:shadow-2xl hover:shadow-slate-300/50',
};

export default function Card({ children, className = '', variant = 'default', header, footer, ...props }) {
  return (
    <div className={clsx('overflow-hidden backdrop-blur-xl', variantStyles[variant], className)} {...props}>
      {header ? (
        <div className="border-b border-slate-200/50 bg-white/50 p-6">
          <h3 className="text-lg font-bold text-slate-900">{header}</h3>
        </div>
      ) : null}
      <div className="p-6">{children}</div>
      {footer ? <div className="border-t border-slate-200/50 bg-white/50 p-6">{footer}</div> : null}
    </div>
  );
}

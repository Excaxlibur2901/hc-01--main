export default function TokenCard({ token, showWait = true, large = false, onAction, actionLabel }) {
  const priorityStyles = {
    emergency: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-300', glow: 'shadow-glow-red', badge: 'badge-emergency', label: '🚨 EMERGENCY' },
    senior: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-300', glow: '', badge: 'badge-senior', label: '👴 Senior' },
    general: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-300', glow: '', badge: 'badge-general', label: '🏥 General' },
  };

  const statusStyles = {
    waiting: 'badge-waiting',
    'in-progress': 'badge-inprogress',
    done: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    cancelled: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600',
  };

  const style = priorityStyles[token.priority] || priorityStyles.general;
  const tokenStr = token.tokenNumber !== undefined ? `A${String(token.tokenNumber).padStart(3, '0')}` : '--';

  return (
    <div className={`p-4 rounded-2xl border-2 ${style.border} bg-white transition-all duration-300 hover:shadow-lg ${token.isEmergency ? 'animate-emergency' : ''} ${large ? 'p-6' : ''} animate-slide-up`}>
      <div className="flex items-center justify-between mb-2">
        <span className={style.badge}>{style.label}</span>
        <span className={statusStyles[token.status] || ''}>{token.status}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className={`${large ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm'} ${style.bg} text-white font-black rounded-xl flex items-center justify-center shadow-lg`}>
          {tokenStr}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 truncate">{token.patientName || '--'}</p>
          {token.age && <p className="text-xs text-slate-500">Age: {token.age}</p>}
          {token.condition && <p className="text-xs text-slate-400 truncate">{token.condition}</p>}
        </div>
      </div>

      {showWait && token.estimatedWaitTime > 0 && token.status === 'waiting' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <span>⏱️</span>
          <span>~{Math.round(token.estimatedWaitTime)} min wait</span>
        </div>
      )}

      {onAction && (
        <button
          onClick={() => onAction(token)}
          className="mt-3 w-full btn-primary text-sm py-2"
        >
          {actionLabel || 'Action'}
        </button>
      )}
    </div>
  );
}

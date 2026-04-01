import TokenCard from './TokenCard';

export default function QueueList({ queue, onAction, actionLabel, isDoctorView = false, displayMode = false }) {
  if (!queue || queue.length === 0) {
    return (
      <div className="text-center py-12 opacity-50">
        <span className="text-4xl mb-3 block">📋</span>
        <p className="text-lg font-medium">No patients in queue</p>
        <p className="text-sm">Tokens will appear here when created</p>
      </div>
    );
  }

  if (displayMode) {
    return (
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {queue.map((token, index) => (
          <div key={token._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white/90">
                #{index + 1}
              </span>
              <span className={`w-3 h-3 rounded-full ${
                token.priority === 'emergency' ? 'bg-red-500 animate-pulse' :
                token.priority === 'senior' ? 'bg-amber-500' : 'bg-sky-500'
              }`} />
              <span className="font-bold text-white text-lg">
                {token.tokenNumber !== undefined ? `A${String(token.tokenNumber).padStart(3, '0')}` : '--'}
              </span>
              <span className="text-white/50 text-sm ml-2 truncate max-w-[120px]">{token.patientName}</span>
            </div>
            <div className="text-right">
              {token.estimatedWaitTime > 0 && (
                <span className="text-white/60 text-sm">~{Math.round(token.estimatedWaitTime)} min</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {queue.map((token, index) => (
        <div key={token._id} style={{ animationDelay: `${index * 60}ms` }}>
          <TokenCard
            token={token}
            onAction={isDoctorView && token.status === 'in-progress' ? onAction : undefined}
            actionLabel={actionLabel}
          />
        </div>
      ))}
    </div>
  );
}

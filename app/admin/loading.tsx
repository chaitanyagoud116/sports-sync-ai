export default function AdminLoading() {
  return (
    <div className="animate-pulse p-2">
      <div className="mb-8">
        <div className="h-6 w-48 rounded bg-white border-surface-200 mb-2"></div>
        <div className="h-4 w-64 rounded bg-surface-50 border-surface-200"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="h-32 glass-card bg-surface-50 border-surface-200 rounded-2xl"></div>
        <div className="h-32 glass-card bg-surface-50 border-surface-200 rounded-2xl"></div>
        <div className="h-32 glass-card bg-surface-50 border-surface-200 rounded-2xl"></div>
        <div className="h-32 glass-card bg-surface-50 border-surface-200 rounded-2xl"></div>
      </div>
      <div className="h-96 glass-card bg-surface-50 border-surface-200 rounded-2xl w-full"></div>
    </div>
  );
}

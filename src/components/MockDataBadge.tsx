export function MockDataBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D49020]/10 border border-[#D49020]/30 rounded text-[#D49020] font-mono text-[10px] uppercase tracking-widest shadow-[0_0_10px_rgba(212,144,32,0.2)] animate-pulse">
      <span className="text-xs">⚠️</span>
      <span>Mock Data Active</span>
    </div>
  );
}

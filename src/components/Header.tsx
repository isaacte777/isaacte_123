interface HeaderProps {
  balance: number;
  income: number;
  expenses: number;
  transactionCount: number;
}

export default function Header({ balance, income, expenses, transactionCount }: HeaderProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <header className="h-11 bg-black border-b border-[#1a1a1a] flex items-center justify-between px-5 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border border-white/20 rounded flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="3" height="3" fill="white" />
              <rect x="6" y="1" width="3" height="3" fill="white" opacity="0.5" />
              <rect x="1" y="6" width="3" height="3" fill="white" opacity="0.5" />
              <rect x="6" y="6" width="3" height="3" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="text-[13px] font-medium text-white tracking-tight">financemap</span>
        </div>
        <div className="h-4 w-px bg-[#1a1a1a]" />
        <span className="text-[11px] text-white/30 font-mono">workspace</span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-px bg-[#0a0a0a] border border-[#1a1a1a] rounded-md overflow-hidden">
        <div className="px-3 py-1.5 flex items-center gap-2 border-r border-[#1a1a1a]">
          <span className="text-[10px] text-white/25 uppercase tracking-wider">in</span>
          <span className="text-[11px] text-white/70 font-mono">{fmt(income)}</span>
        </div>
        <div className="px-3 py-1.5 flex items-center gap-2 border-r border-[#1a1a1a]">
          <span className="text-[10px] text-white/25 uppercase tracking-wider">out</span>
          <span className="text-[11px] text-white/50 font-mono">{fmt(expenses)}</span>
        </div>
        <div className="px-3 py-1.5 flex items-center gap-2">
          <span className="text-[10px] text-white/25 uppercase tracking-wider">net</span>
          <span className={`text-[11px] font-mono font-medium ${balance >= 0 ? 'text-white' : 'text-white/40'}`}>
            {fmt(balance)}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-white/20 font-mono">{transactionCount} ops</span>
        <div className="w-5 h-5 border border-[#1a1a1a] rounded flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </div>
      </div>
    </header>
  );
}

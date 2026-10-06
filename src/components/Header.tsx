interface HeaderProps {
  balance: number;
  income: number;
  expenses: number;
  transactionCount: number;
}

export default function Header({ balance, income, expenses, transactionCount }: HeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <header className="h-12 bg-black border-b border-gray-800 flex items-center justify-between px-5 shrink-0">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-gray-200 tracking-tight">FinanceMap</h1>
          <span className="text-[9px] text-gray-700 bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded font-mono">PRO</span>
        </div>
      </div>

      {/* Center - Quick Stats */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-6 bg-gray-950 border border-gray-800 rounded-lg px-4 py-1.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            <span className="text-[10px] text-gray-600">ING</span>
            <span className="text-[11px] text-gray-300 font-semibold">{formatCurrency(income)}</span>
          </div>
          <div className="w-px h-4 bg-gray-800" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
            <span className="text-[10px] text-gray-600">GAS</span>
            <span className="text-[11px] text-gray-400 font-semibold">{formatCurrency(expenses)}</span>
          </div>
          <div className="w-px h-4 bg-gray-800" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600">BAL</span>
            <span className={`text-[11px] font-bold ${balance >= 0 ? 'text-gray-100' : 'text-gray-500'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Right - Info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-[10px] text-gray-700">{transactionCount} registros</span>
        </div>
        <div className="w-7 h-7 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
          <span className="text-[10px] text-gray-500">⚙</span>
        </div>
      </div>
    </header>
  );
}

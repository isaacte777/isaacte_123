interface HeaderProps {
  balance: number;
  income: number;
  expenses: number;
}

export default function Header({ balance, income, expenses }: HeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
          <span className="text-lg">📊</span>
        </div>
        <h1 className="text-xl font-bold text-gray-100 tracking-tight">FinanceMap</h1>
        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full ml-2">v1.0</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Ingresos</p>
          <p className="text-sm font-semibold text-gray-300">{formatCurrency(income)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Gastos</p>
          <p className="text-sm font-semibold text-gray-300">{formatCurrency(expenses)}</p>
        </div>
        <div className="text-right border-l border-gray-600 pl-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Balance</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-gray-100' : 'text-gray-400'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </header>
  );
}

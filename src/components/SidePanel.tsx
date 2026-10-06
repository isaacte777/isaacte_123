import { useState } from 'react';
import { Transaction, Category } from '../types';

interface SidePanelProps {
  categories: Category[];
  transactions: Transaction[];
  selectedNode: string | null;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  balance: number;
  income: number;
  expenses: number;
}

export default function SidePanel({
  categories,
  transactions,
  selectedNode,
  onAddTransaction,
  onDeleteTransaction,
  balance,
  income,
  expenses,
}: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'summary'>('summary');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('alimentacion');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onAddTransaction({
      description,
      amount: type === 'expense' ? -numAmount : numAmount,
      type,
      category: selectedNode || category,
      date,
    });

    setDescription('');
    setAmount('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const filteredTransactions = selectedNode
    ? transactions.filter(t => t.category === selectedNode)
    : transactions;

  const selectedCategory = categories.find(c => c.id === selectedNode);

  return (
    <div className="w-80 bg-black border-l border-gray-800 flex flex-col h-full shrink-0">
      {/* Panel Header */}
      <div className="px-4 py-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Panel de Control</h2>
            <p className="text-[10px] text-gray-600 mt-0.5">Gestión financiera</p>
          </div>
          <div className="w-8 h-8 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 shrink-0">
        {[
          { id: 'summary' as const, label: 'Resumen', icon: '◉' },
          { id: 'add' as const, label: 'Agregar', icon: '⊕' },
          { id: 'list' as const, label: 'Historial', icon: '≡' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 text-[11px] font-medium transition-all ${
              activeTab === tab.id
                ? 'text-gray-200 border-b border-gray-400 bg-gray-950'
                : 'text-gray-600 hover:text-gray-400 border-b border-transparent'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selected Node Info */}
      {selectedNode && selectedCategory && (
        <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{selectedCategory.icon}</span>
            <div>
              <p className="text-xs font-medium text-gray-300">{selectedCategory.name}</p>
              <p className="text-[10px] text-gray-600">Filtro activo</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* SUCCESS NOTIFICATION */}
        {showSuccess && (
          <div className="mx-4 mt-3 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 animate-fadeIn">
            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-[10px] text-gray-300">✓</span>
            </div>
            <span className="text-xs text-gray-300">Transacción registrada</span>
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="p-4 space-y-3">
            {/* Main Balance */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Balance Neto</p>
              <p className={`text-2xl font-bold tracking-tight ${balance >= 0 ? 'text-gray-100' : 'text-gray-500'}`}>
                {formatCurrency(balance)}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-600">Ingresos</span>
                    <span className="text-[10px] text-gray-400">{formatCurrency(income)}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500 rounded-full transition-all duration-700"
                      style={{ width: `${income > 0 ? (income / (income + expenses)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-600">Gastos</span>
                    <span className="text-[10px] text-gray-400">{formatCurrency(expenses)}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-700 rounded-full transition-all duration-700"
                      style={{ width: `${expenses > 0 ? (expenses / (income + expenses)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <p className="text-[10px] text-gray-600 uppercase">Transacciones</p>
                <p className="text-lg font-bold text-gray-200 mt-0.5">{transactions.length}</p>
              </div>
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <p className="text-[10px] text-gray-600 uppercase">Promedio</p>
                <p className="text-lg font-bold text-gray-200 mt-0.5">
                  {formatCurrency(transactions.length > 0 ? expenses / Math.max(1, transactions.filter(t => t.amount < 0).length) : 0)}
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 px-1">Desglose</p>
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const catTotal = transactions
                    .filter(t => t.category === cat.id)
                    .reduce((sum, t) => sum + t.amount, 0);
                  const count = transactions.filter(t => t.category === cat.id).length;
                  const pct = expenses > 0 && catTotal < 0 ? (Math.abs(catTotal) / expenses) * 100 : 0;

                  return (
                    <div key={cat.id} className="bg-gray-950 border border-gray-800 rounded-lg p-2.5 hover:border-gray-700 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{cat.icon}</span>
                          <span className="text-[11px] text-gray-300 font-medium">{cat.name}</span>
                        </div>
                        <span className={`text-[11px] font-bold ${catTotal >= 0 ? 'text-gray-200' : 'text-gray-500'}`}>
                          {formatCurrency(catTotal)}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-gray-700">{count} ops</span>
                        <span className="text-[9px] text-gray-700">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ADD TAB */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Type */}
            <div>
              <label className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 block">Operación</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                    type === 'expense'
                      ? 'bg-gray-800 text-gray-200 border-gray-600'
                      : 'bg-gray-950 text-gray-600 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  ↓ Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                    type === 'income'
                      ? 'bg-gray-800 text-gray-200 border-gray-600'
                      : 'bg-gray-950 text-gray-600 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  ↑ Ingreso
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 block">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compra supermercado"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-gray-200 placeholder-gray-700 focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 block">Monto (€)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-gray-200 placeholder-gray-700 focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>

            {/* Category */}
            {!selectedNode && (
              <div>
                <label className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 block">Categoría</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 rounded-lg text-center transition-all border ${
                        category === cat.id
                          ? 'bg-gray-800 border-gray-600 text-gray-200'
                          : 'bg-gray-950 border-gray-800 text-gray-600 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <p className="text-[9px] mt-0.5">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 block">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-3 px-4 rounded-lg transition-all border border-gray-700 hover:border-gray-600 text-xs uppercase tracking-wider"
            >
              {type === 'expense' ? '↓ Registrar Gasto' : '↑ Registrar Ingreso'}
            </button>
          </form>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div className="p-3 space-y-1.5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-gray-600 text-lg">∅</span>
                </div>
                <p className="text-xs text-gray-600">Sin transacciones</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const cat = categories.find(c => c.id === transaction.category);
                return (
                  <div
                    key={transaction.id}
                    className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex items-center justify-between group hover:border-gray-700 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{cat?.icon || '•'}</span>
                        <p className="text-[11px] font-medium text-gray-300 truncate">{transaction.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 ml-5">
                        <span className="text-[9px] text-gray-700">{transaction.date}</span>
                        <span className="text-[9px] text-gray-800">•</span>
                        <span className="text-[9px] text-gray-700">{cat?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-xs font-bold ${transaction.amount >= 0 ? 'text-gray-200' : 'text-gray-500'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </span>
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-gray-700 hover:text-gray-300 hover:bg-gray-800 transition-all text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-800 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gray-700">FinanceMap v2.0</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
            <span className="text-[9px] text-gray-700">Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

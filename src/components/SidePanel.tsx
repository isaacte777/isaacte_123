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
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'summary'>('add');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('alimentacion');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
    <div className="flex flex-col h-full bg-gray-850">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 shrink-0">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'text-gray-100 border-b-2 border-gray-400 bg-gray-800'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          ➕ Agregar
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'text-gray-100 border-b-2 border-gray-400 bg-gray-800'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          📋 Lista
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'summary'
              ? 'text-gray-100 border-b-2 border-gray-400 bg-gray-800'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          📊 Resumen
        </button>
      </div>

      {/* Selected Node Info */}
      {selectedNode && selectedCategory && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCategory.icon}</span>
            <div>
              <p className="text-sm font-medium text-gray-200">{selectedCategory.name}</p>
              <p className="text-xs text-gray-500">Filtrando por categoría</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Type selector */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Tipo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    type === 'expense'
                      ? 'bg-gray-600 text-gray-100 border border-gray-500'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  ↓ Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    type === 'income'
                      ? 'bg-gray-600 text-gray-100 border border-gray-500'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  ↑ Ingreso
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compra supermercado"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Cantidad (€)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            {/* Category */}
            {!selectedNode && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gray-600 hover:bg-gray-500 text-gray-100 font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-500"
            >
              {type === 'expense' ? '↓ Registrar Gasto' : '↑ Registrar Ingreso'}
            </button>
          </form>
        )}

        {activeTab === 'list' && (
          <div className="p-4 space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No hay transacciones</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between group hover:border-gray-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{transaction.date}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">
                        {categories.find(c => c.id === transaction.category)?.icon}{' '}
                        {categories.find(c => c.id === transaction.category)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-sm font-bold ${transaction.amount >= 0 ? 'text-gray-200' : 'text-gray-400'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="p-4 space-y-4">
            {/* Balance Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Balance Total</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-100' : 'text-gray-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>

            {/* Income vs Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ingresos</p>
                <p className="text-lg font-bold text-gray-200">{formatCurrency(income)}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gastos</p>
                <p className="text-lg font-bold text-gray-400">{formatCurrency(expenses)}</p>
              </div>
            </div>

            {/* Category breakdown */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Desglose por Categoría</p>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const catTransactions = transactions.filter(t => t.category === cat.id);
                  const catTotal = catTransactions.reduce((sum, t) => sum + t.amount, 0);
                  const percentage = expenses > 0 ? (Math.abs(Math.min(0, catTotal)) / expenses) * 100 : 0;

                  return (
                    <div key={cat.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="text-sm text-gray-300">{cat.name}</span>
                        </div>
                        <span className={`text-sm font-medium ${catTotal >= 0 ? 'text-gray-200' : 'text-gray-400'}`}>
                          {formatCurrency(catTotal)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{catTransactions.length} transacciones</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly stats */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Estadísticas</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total transacciones</span>
                  <span className="text-sm text-gray-200 font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Promedio por gasto</span>
                  <span className="text-sm text-gray-200 font-medium">
                    {formatCurrency(transactions.filter(t => t.amount < 0).length > 0 
                      ? expenses / transactions.filter(t => t.amount < 0).length 
                      : 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Mayor ingreso</span>
                  <span className="text-sm text-gray-200 font-medium">
                    {formatCurrency(Math.max(0, ...transactions.map(t => t.amount)))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Mayor gasto</span>
                  <span className="text-sm text-gray-200 font-medium">
                    {formatCurrency(Math.abs(Math.min(0, ...transactions.map(t => t.amount))))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

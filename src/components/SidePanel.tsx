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
  categories, transactions, selectedNode,
  onAddTransaction, onDeleteTransaction, balance, income, expenses,
}: SidePanelProps) {
  const [tab, setTab] = useState<'summary' | 'add' | 'list'>('summary');
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [cat, setCat] = useState('alimentacion');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [toast, setToast] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amt);
    if (!desc || isNaN(n) || n <= 0) return;
    onAddTransaction({
      description: desc,
      amount: type === 'expense' ? -n : n,
      type,
      category: selectedNode || cat,
      date,
    });
    setDesc(''); setAmt('');
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  const filtered = selectedNode ? transactions.filter(t => t.category === selectedNode) : transactions;
  const selectedCat = categories.find(c => c.id === selectedNode);

  return (
    <div className="w-72 bg-black border-l border-[#1a1a1a] flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-white/20">
            <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" rx="1" />
            <line x1="0.5" y1="4" x2="9.5" y2="4" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <span className="text-[11px] text-white/40 font-medium">panel</span>
        </div>
        {selectedNode && selectedCat && (
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded px-1.5 py-0.5">
            <span className="text-[9px] text-white/40 font-mono">{selectedCat.symbol}</span>
            <span className="text-[9px] text-white/30 font-mono">{selectedCat.name}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a1a1a]">
        {[
          { id: 'summary' as const, label: 'overview' },
          { id: 'add' as const, label: 'new' },
          { id: 'list' as const, label: 'history' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-wider transition-all border-b ${
              tab === t.id
                ? 'text-white/70 border-white/30 bg-white/[0.02]'
                : 'text-white/20 border-transparent hover:text-white/40'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="mx-3 mt-2 bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 flex items-center gap-2 animate-fadeIn">
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-white/40"><polyline points="2,5 4,7 8,3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          <span className="text-[10px] text-white/40 font-mono">registered</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ─── SUMMARY ─── */}
        {tab === 'summary' && (
          <div className="p-3 space-y-2.5">
            {/* Balance */}
            <div className="border border-[#1a1a1a] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">balance</span>
                <span className={`text-[10px] font-mono ${balance >= 0 ? 'text-white/30' : 'text-white/15'}`}>
                  {balance >= 0 ? 'positive' : 'negative'}
                </span>
              </div>
              <p className={`text-xl font-light tracking-tight font-mono ${balance >= 0 ? 'text-white' : 'text-white/40'}`}>
                {fmt(balance)}
              </p>
              {/* Bar */}
              <div className="mt-3 flex gap-1 h-1">
                <div className="bg-white/20 rounded-full transition-all duration-700"
                  style={{ width: `${income > 0 ? (income / (income + expenses)) * 100 : 50}%` }} />
                <div className="bg-white/[0.06] rounded-full transition-all duration-700 flex-1" />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] text-white/20 font-mono">in: {fmt(income)}</span>
                <span className="text-[9px] text-white/20 font-mono">out: {fmt(expenses)}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="border border-[#1a1a1a] rounded p-2.5">
                <span className="text-[8px] text-white/15 uppercase font-mono block">ops</span>
                <span className="text-sm text-white/60 font-mono font-light">{transactions.length}</span>
              </div>
              <div className="border border-[#1a1a1a] rounded p-2.5">
                <span className="text-[8px] text-white/15 uppercase font-mono block">avg/expense</span>
                <span className="text-sm text-white/60 font-mono font-light">
                  {fmt(transactions.filter(t => t.amount < 0).length > 0
                    ? expenses / transactions.filter(t => t.amount < 0).length : 0)}
                </span>
              </div>
            </div>

            {/* Categories */}
            <div>
              <span className="text-[9px] text-white/15 uppercase tracking-widest font-mono block mb-2 px-0.5">categories</span>
              <div className="space-y-1">
                {categories.map(c => {
                  const total = transactions.filter(t => t.category === c.id).reduce((s, t) => s + t.amount, 0);
                  const count = transactions.filter(t => t.category === c.id).length;
                  const pct = expenses > 0 && total < 0 ? (Math.abs(total) / expenses) * 100 : 0;
                  return (
                    <div key={c.id} className="border border-[#1a1a1a] rounded px-2.5 py-2 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/30 font-mono w-3 text-center">{c.symbol}</span>
                          <span className="text-[10px] text-white/50 font-mono">{c.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono ${total >= 0 ? 'text-white/50' : 'text-white/25'}`}>
                          {fmt(total)}
                        </span>
                      </div>
                      <div className="mt-1.5 w-full h-px bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-white/10 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[8px] text-white/10 font-mono">{count}</span>
                        <span className="text-[8px] text-white/10 font-mono">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── ADD ─── */}
        {tab === 'add' && (
          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            {/* Type */}
            <div>
              <label className="text-[9px] text-white/20 uppercase tracking-widest font-mono mb-1.5 block">type</label>
              <div className="flex gap-1">
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`flex-1 py-2 text-[10px] font-mono uppercase rounded border transition-all ${
                      type === t
                        ? 'bg-white/5 border-white/20 text-white/70'
                        : 'bg-transparent border-[#1a1a1a] text-white/20 hover:border-white/10'
                    }`}>
                    {t === 'expense' ? '↓ expense' : '↑ income'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[9px] text-white/20 uppercase tracking-widest font-mono mb-1.5 block">description</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="e.g. hosting fee"
                className="w-full bg-transparent border border-[#1a1a1a] rounded px-2.5 py-2 text-[11px] text-white/70 placeholder-white/10 font-mono focus:outline-none focus:border-white/20 transition-colors" />
            </div>

            {/* Amount */}
            <div>
              <label className="text-[9px] text-white/20 uppercase tracking-widest font-mono mb-1.5 block">amount</label>
              <input type="number" value={amt} onChange={e => setAmt(e.target.value)}
                placeholder="0.00" min="0" step="0.01"
                className="w-full bg-transparent border border-[#1a1a1a] rounded px-2.5 py-2 text-[11px] text-white/70 placeholder-white/10 font-mono focus:outline-none focus:border-white/20 transition-colors" />
            </div>

            {/* Category */}
            {!selectedNode && (
              <div>
                <label className="text-[9px] text-white/20 uppercase tracking-widest font-mono mb-1.5 block">category</label>
                <div className="grid grid-cols-3 gap-1">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => setCat(c.id)}
                      className={`py-1.5 rounded border text-center transition-all ${
                        cat === c.id
                          ? 'bg-white/5 border-white/20'
                          : 'bg-transparent border-[#1a1a1a] hover:border-white/10'
                      }`}>
                      <span className={`text-[10px] font-mono ${cat === c.id ? 'text-white/60' : 'text-white/20'}`}>{c.symbol}</span>
                      <p className={`text-[7px] font-mono mt-0.5 ${cat === c.id ? 'text-white/40' : 'text-white/15'}`}>{c.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="text-[9px] text-white/20 uppercase tracking-widest font-mono mb-1.5 block">date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-transparent border border-[#1a1a1a] rounded px-2.5 py-2 text-[11px] text-white/70 font-mono focus:outline-none focus:border-white/20 transition-colors" />
            </div>

            {/* Submit */}
            <button type="submit"
              className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/60 hover:text-white/80 font-mono text-[10px] uppercase tracking-wider py-2.5 rounded transition-all">
              register {type}
            </button>
          </form>
        )}

        {/* ─── LIST ─── */}
        {tab === 'list' && (
          <div className="p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-[10px] text-white/15 font-mono">no records</span>
              </div>
            ) : (
              filtered.map(t => {
                const c = categories.find(x => x.id === t.category);
                return (
                  <div key={t.id}
                    className="border border-[#1a1a1a] rounded px-2.5 py-2 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/20 font-mono">{c?.symbol}</span>
                        <span className="text-[10px] text-white/50 font-mono truncate">{t.description}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 ml-4">
                        <span className="text-[8px] text-white/10 font-mono">{t.date}</span>
                        <span className="text-[8px] text-white/10">·</span>
                        <span className="text-[8px] text-white/10 font-mono">{c?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className={`text-[10px] font-mono ${t.amount >= 0 ? 'text-white/50' : 'text-white/25'}`}>
                        {t.amount >= 0 ? '+' : ''}{fmt(t.amount)}
                      </span>
                      <button onClick={() => onDeleteTransaction(t.id)}
                        className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-white/20 hover:text-white/60 transition-all text-[9px]">
                        ×
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
      <div className="px-3 py-1.5 border-t border-[#1a1a1a] flex items-center justify-between">
        <span className="text-[8px] text-white/10 font-mono">financemap v2.0</span>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[8px] text-white/10 font-mono">active</span>
        </div>
      </div>
    </div>
  );
}

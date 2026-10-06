import { useState, useRef, useEffect } from 'react';
import FinanceMap from './components/FinanceMap';
import SidePanel from './components/SidePanel';
import Header from './components/Header';
import { Transaction, Category, MapNode } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Salario', amount: 3500, type: 'income', category: 'ingresos', date: '2026-01-15' },
    { id: '2', description: 'Alquiler', amount: -1200, type: 'expense', category: 'vivienda', date: '2026-01-01' },
    { id: '3', description: 'Supermercado', amount: -350, type: 'expense', category: 'alimentacion', date: '2026-01-10' },
    { id: '4', description: 'Transporte', amount: -150, type: 'expense', category: 'transporte', date: '2026-01-08' },
    { id: '5', description: 'Freelance', amount: 800, type: 'income', category: 'ingresos', date: '2026-01-20' },
    { id: '6', description: 'Entretenimiento', amount: -200, type: 'expense', category: 'ocio', date: '2026-01-12' },
    { id: '7', description: 'Servicios', amount: -180, type: 'expense', category: 'servicios', date: '2026-01-05' },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const categories: Category[] = [
    { id: 'ingresos', name: 'Ingresos', icon: '💰', color: '#6b7280' },
    { id: 'vivienda', name: 'Vivienda', icon: '🏠', color: '#4b5563' },
    { id: 'alimentacion', name: 'Alimentación', icon: '🛒', color: '#374151' },
    { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#1f2937' },
    { id: 'ocio', name: 'Ocio', icon: '🎮', color: '#9ca3af' },
    { id: 'servicios', name: 'Servicios', icon: '⚡', color: '#6b7280' },
  ];

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const mapNodes: MapNode[] = categories.map((cat, index) => {
    const catTransactions = transactions.filter(t => t.category === cat.id);
    const catTotal = catTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Position nodes in a map-like layout
    const positions = [
      { x: 50, y: 30 },
      { x: 25, y: 50 },
      { x: 75, y: 50 },
      { x: 20, y: 75 },
      { x: 50, y: 70 },
      { x: 80, y: 75 },
    ];

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      x: positions[index].x,
      y: positions[index].y,
      total: catTotal,
      transactionCount: catTransactions.length,
    };
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden">
      <Header balance={balance} income={totalIncome} expenses={totalExpenses} />
      <div className="flex flex-1 overflow-hidden">
        {/* Map Panel - Left/Center */}
        <div className="flex-1 relative overflow-hidden">
          <FinanceMap
            nodes={mapNodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            transactions={transactions}
          />
        </div>
        {/* Side Panel - Right */}
        <div className="w-96 border-l border-gray-700 overflow-y-auto">
          <SidePanel
            categories={categories}
            transactions={transactions}
            selectedNode={selectedNode}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            balance={balance}
            income={totalIncome}
            expenses={totalExpenses}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

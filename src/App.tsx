import { useState, useCallback } from 'react';
import FinanceMap from './components/FinanceMap';
import SidePanel from './components/SidePanel';
import ShapePanel from './components/ShapePanel';
import Header from './components/Header';
import { Transaction, Category, MapNode, DraggableShape, PlacedShape } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Salario mensual', amount: 3500, type: 'income', category: 'ingresos', date: '2026-01-15' },
    { id: '2', description: 'Alquiler piso', amount: -1200, type: 'expense', category: 'vivienda', date: '2026-01-01' },
    { id: '3', description: 'Supermercado semanal', amount: -350, type: 'expense', category: 'alimentacion', date: '2026-01-10' },
    { id: '4', description: 'Gasolina', amount: -150, type: 'expense', category: 'transporte', date: '2026-01-08' },
    { id: '5', description: 'Proyecto freelance', amount: 800, type: 'income', category: 'ingresos', date: '2026-01-20' },
    { id: '6', description: 'Cine y ocio', amount: -200, type: 'expense', category: 'ocio', date: '2026-01-12' },
    { id: '7', description: 'Luz y agua', amount: -180, type: 'expense', category: 'servicios', date: '2026-01-05' },
    { id: '8', description: 'Internet y móvil', amount: -85, type: 'expense', category: 'servicios', date: '2026-01-03' },
    { id: '9', description: 'Restaurante', amount: -75, type: 'expense', category: 'alimentacion', date: '2026-01-18' },
    { id: '10', description: 'Seguro coche', amount: -120, type: 'expense', category: 'transporte', date: '2026-01-02' },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([
    { id: 'ps1', type: 'circle', label: 'Meta ahorro', x: 300, y: 200, linkedNode: 'ingresos', note: '' },
    { id: 'ps2', type: 'diamond', label: 'Urgente', x: 600, y: 350, linkedNode: 'vivienda', note: '' },
  ]);

  const categories: Category[] = [
    { id: 'ingresos', name: 'Ingresos', icon: '💰' },
    { id: 'vivienda', name: 'Vivienda', icon: '🏠' },
    { id: 'alimentacion', name: 'Alimentación', icon: '🛒' },
    { id: 'transporte', name: 'Transporte', icon: '🚗' },
    { id: 'ocio', name: 'Ocio', icon: '🎮' },
    { id: 'servicios', name: 'Servicios', icon: '⚡' },
  ];

  const availableShapes: DraggableShape[] = [
    { id: 'shape-circle', type: 'circle', label: 'Círculo', description: 'Forma circular - ideal para metas' },
    { id: 'shape-square', type: 'square', label: 'Cuadrado', description: 'Forma cuadrada - estabilidad' },
    { id: 'shape-triangle', type: 'triangle', label: 'Triángulo', description: 'Forma triangular - prioridades' },
    { id: 'shape-hexagon', type: 'hexagon', label: 'Hexágono', description: 'Forma hexagonal - conexiones' },
    { id: 'shape-diamond', type: 'diamond', label: 'Diamante', description: 'Forma diamante - valor' },
    { id: 'shape-star', type: 'star', label: 'Estrella', description: 'Forma estelar - destacado' },
    { id: 'shape-pentagon', type: 'pentagon', label: 'Pentágono', description: 'Forma pentagonal - balance' },
    { id: 'shape-octagon', type: 'octagon', label: 'Octágono', description: 'Forma octagonal - protección' },
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

  const placeShape = useCallback((shape: DraggableShape, x: number, y: number) => {
    const newShape: PlacedShape = {
      id: `placed-${Date.now()}`,
      type: shape.type,
      label: shape.label,
      x,
      y,
      linkedNode: selectedNode,
      note: '',
    };
    setPlacedShapes(prev => [...prev, newShape]);
  }, [selectedNode]);

  const moveShape = useCallback((id: string, x: number, y: number) => {
    setPlacedShapes(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }, []);

  const removeShape = useCallback((id: string) => {
    setPlacedShapes(prev => prev.filter(s => s.id !== id));
    if (selectedShape === id) setSelectedShape(null);
  }, [selectedShape]);

  const handleShapeDragStart = (_shape: DraggableShape) => {
    // Could add visual feedback here
  };

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const mapNodes: MapNode[] = categories.map((cat, index) => {
    const catTransactions = transactions.filter(t => t.category === cat.id);
    const catTotal = catTransactions.reduce((sum, t) => sum + t.amount, 0);

    const positions = [
      { x: 50, y: 25 },
      { x: 22, y: 45 },
      { x: 78, y: 45 },
      { x: 18, y: 72 },
      { x: 50, y: 65 },
      { x: 82, y: 72 },
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
    <div className="h-screen w-screen flex flex-col bg-black text-gray-100 overflow-hidden">
      {/* Top Header */}
      <Header
        balance={balance}
        income={totalIncome}
        expenses={totalExpenses}
        transactionCount={transactions.length}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Shape Panel */}
        <ShapePanel
          shapes={availableShapes}
          onDragStart={handleShapeDragStart}
        />

        {/* Center - Finance Map Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <FinanceMap
            nodes={mapNodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            transactions={transactions}
            placedShapes={placedShapes}
            onPlaceShape={placeShape}
            onMoveShape={moveShape}
            onRemoveShape={removeShape}
            onSelectShape={setSelectedShape}
            selectedShape={selectedShape}
          />
        </div>

        {/* Right - Control Panel */}
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
  );
}

export default App;

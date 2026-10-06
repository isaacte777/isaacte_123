import { useState, useRef, useCallback, useEffect } from 'react';
import FinanceMap from './components/FinanceMap';
import SidePanel from './components/SidePanel';
import ShapePanel from './components/ShapePanel';
import Header from './components/Header';
import { Transaction, Category, MapNode, DraggableShape, PlacedShape } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Salario mensual', amount: 3500, type: 'income', category: 'ingresos', date: '2026-01-15' },
    { id: '2', description: 'Alquiler', amount: -1200, type: 'expense', category: 'vivienda', date: '2026-01-01' },
    { id: '3', description: 'Supermercado', amount: -350, type: 'expense', category: 'alimentacion', date: '2026-01-10' },
    { id: '4', description: 'Gasolina', amount: -150, type: 'expense', category: 'transporte', date: '2026-01-08' },
    { id: '5', description: 'Freelance web', amount: 800, type: 'income', category: 'ingresos', date: '2026-01-20' },
    { id: '6', description: 'Suscripciones', amount: -95, type: 'expense', category: 'ocio', date: '2026-01-12' },
    { id: '7', description: 'Electricidad', amount: -120, type: 'expense', category: 'servicios', date: '2026-01-05' },
    { id: '8', description: 'Hosting & dominio', amount: -45, type: 'expense', category: 'servicios', date: '2026-01-03' },
    { id: '9', description: 'Restaurante', amount: -75, type: 'expense', category: 'alimentacion', date: '2026-01-18' },
    { id: '10', description: 'Seguro', amount: -120, type: 'expense', category: 'transporte', date: '2026-01-02' },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([
    { id: 'ps1', type: 'circle', label: 'Meta ahorro', x: 280, y: 180, linkedNode: 'ingresos' },
    { id: 'ps2', type: 'diamond', label: 'Prioridad', x: 580, y: 320, linkedNode: 'vivienda' },
  ]);

  const categories: Category[] = [
    { id: 'ingresos', name: 'Ingresos', symbol: '↑' },
    { id: 'vivienda', name: 'Vivienda', symbol: '⌂' },
    { id: 'alimentacion', name: 'Alimentación', symbol: '◈' },
    { id: 'transporte', name: 'Transporte', symbol: '→' },
    { id: 'ocio', name: 'Ocio', symbol: '◇' },
    { id: 'servicios', name: 'Servicios', symbol: '⚡' },
  ];

  const availableShapes: DraggableShape[] = [
    { id: 'shape-circle', type: 'circle', label: 'Círculo' },
    { id: 'shape-square', type: 'square', label: 'Cuadrado' },
    { id: 'shape-triangle', type: 'triangle', label: 'Triángulo' },
    { id: 'shape-hexagon', type: 'hexagon', label: 'Hexágono' },
    { id: 'shape-diamond', type: 'diamond', label: 'Diamante' },
    { id: 'shape-star', type: 'star', label: 'Estrella' },
    { id: 'shape-pentagon', type: 'pentagon', label: 'Pentágono' },
    { id: 'shape-octagon', type: 'octagon', label: 'Octágono' },
  ];

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...transaction, id: Date.now().toString() }, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const placeShape = useCallback((shape: DraggableShape, x: number, y: number) => {
    setPlacedShapes(prev => [...prev, {
      id: `placed-${Date.now()}`,
      type: shape.type,
      label: shape.label,
      x, y,
      linkedNode: selectedNode,
    }]);
  }, [selectedNode]);

  const moveShape = useCallback((id: string, x: number, y: number) => {
    setPlacedShapes(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }, []);

  const removeShape = useCallback((id: string) => {
    setPlacedShapes(prev => prev.filter(s => s.id !== id));
    if (selectedShape === id) setSelectedShape(null);
  }, [selectedShape]);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodeOverrides(prev => ({ ...prev, [id]: { x, y } }));
  }, []);

  const [nodeOverrides, setNodeOverrides] = useState<Record<string, { x: number; y: number }>>({});

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const defaultPositions: Record<string, { x: number; y: number }> = {
    ingresos: { x: 50, y: 22 },
    vivienda: { x: 22, y: 42 },
    alimentacion: { x: 78, y: 42 },
    transporte: { x: 18, y: 70 },
    ocio: { x: 50, y: 62 },
    servicios: { x: 82, y: 70 },
  };

  const mapNodes: MapNode[] = categories.map((cat) => {
    const catTransactions = transactions.filter(t => t.category === cat.id);
    const catTotal = catTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pos = nodeOverrides[cat.id] || defaultPositions[cat.id];

    return {
      id: cat.id,
      name: cat.name,
      symbol: cat.symbol,
      x: pos.x,
      y: pos.y,
      total: catTotal,
      transactionCount: catTransactions.length,
    };
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden select-none">
      <Header
        balance={balance}
        income={totalIncome}
        expenses={totalExpenses}
        transactionCount={transactions.length}
      />
      <div className="flex flex-1 overflow-hidden">
        <ShapePanel shapes={availableShapes} onDragStart={() => {}} />
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
            onMoveNode={moveNode}
          />
        </div>
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

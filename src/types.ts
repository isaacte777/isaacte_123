export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  symbol: string;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'diamond' | 'star' | 'pentagon' | 'octagon';

export interface DraggableShape {
  id: string;
  type: ShapeType;
  label: string;
}

export interface PlacedShape {
  id: string;
  type: ShapeType;
  label: string;
  x: number;
  y: number;
  linkedNode: string | null;
}

export interface MapNode {
  id: string;
  name: string;
  symbol: string;
  x: number;
  y: number;
  total: number;
  transactionCount: number;
}

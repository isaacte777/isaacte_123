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
  icon: string;
  color: string;
}

export interface MapNode {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  total: number;
  transactionCount: number;
}

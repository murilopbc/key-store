export interface Product {
  id: number;
  name: string;
  category: string;
  model: string;
  barcode: string | null;
  costPrice: number;
  salePrice: number;
  quantity: number;
  minStock: number;
  photoUri: string | null;
  createdAt: string; // ISO 8601
}

// Quem gera id e createdAt é o banco, não o usuário.
export interface CreateProductInput {
  name: string;
  category: string;
  model: string;
  barcode: string | null;
  costPrice: number;
  salePrice: number;
  quantity: number;
  minStock: number;
  photoUri: string | null;
}

export type UpdateProductInput = CreateProductInput;

export type StockFilter = 'all' | 'low';

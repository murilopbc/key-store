import { Product } from './product';

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito';
export type SaleStatus = 'concluida' | 'cancelada';
export type PeriodFilter = 'today' | 'week' | 'month' | 'all';

export interface Sale {
  id: number;
  createdAt: string;
  total: number; // já com desconto aplicado
  discount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number | null; // null se o produto foi excluído depois
  productName: string; // "foto" do nome no momento da venda
  quantity: number;
  unitPrice: number;
  unitCost: number; // guardado para calcular o lucro depois
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreateSaleItemInput {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface CreateSaleInput {
  items: CreateSaleItemInput[];
  discount: number;
  paymentMethod: PaymentMethod;
}

export interface PeriodSummary {
  total: number;
  count: number;
  cost: number;
  profit: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

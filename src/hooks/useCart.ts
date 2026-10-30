import { useState, useCallback, useMemo } from 'react';
import * as ProductRepository from '../database/productRepository';
import * as SaleRepository from '../database/saleRepository';
import { checkStockAlerts } from '../services/stockAlerts';
import { parseMoney } from '../utils/format';
import { Product } from '../types/product';
import { CartItem, PaymentMethod } from '../types/sale';

export type AddResult = 'added' | 'no_stock' | 'not_found';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountText, setDiscountText] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [saving, setSaving] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0),
    [items],
  );
  const discount = Math.min(Math.max(parseMoney(discountText), 0), subtotal);
  const total = subtotal - discount;

  const addProduct = useCallback(
    (product: Product): AddResult => {
      const existing = items.find((i) => i.product.id === product.id);
      const current = existing?.quantity ?? 0;
      if (current + 1 > product.quantity) return 'no_stock';

      setItems(
        existing
          ? items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...items, { product, quantity: 1 }],
      );
      return 'added';
    },
    [items],
  );

  const addByBarcode = useCallback(
    async (barcode: string): Promise<AddResult> => {
      const product = await ProductRepository.getProductByBarcode(barcode.trim());
      if (!product) return 'not_found';
      return addProduct(product);
    },
    [addProduct],
  );

  const changeQuantity = useCallback((productId: number, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        const next = Math.min(Math.max(i.quantity + delta, 1), i.product.quantity);
        return { ...i, quantity: next };
      }),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setDiscountText('');
    setPaymentMethod('dinheiro');
  }, []);

  /** Grava a venda, dá baixa no estoque e devolve o id da venda. */
  const finalize = useCallback(async (): Promise<number> => {
    if (items.length === 0) throw new Error('Adicione ao menos um item.');
    setSaving(true);
    try {
      const saleId = await SaleRepository.createSale({
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.product.salePrice,
          unitCost: i.product.costPrice,
        })),
        discount,
        paymentMethod,
      });
      try {
        await checkStockAlerts(items.map((i) => i.product.id));
      } catch (error) {
        console.error('Erro ao gerar alertas de estoque:', error);
      }
      clear();
      return saleId;
    } finally {
      setSaving(false);
    }
  }, [items, discount, paymentMethod, clear]);

  return {
    items,
    subtotal,
    discount,
    total,
    discountText,
    setDiscountText,
    paymentMethod,
    setPaymentMethod,
    saving,
    addProduct,
    addByBarcode,
    changeQuantity,
    removeItem,
    finalize,
  };
}

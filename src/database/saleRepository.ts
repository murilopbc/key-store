import { getDatabase } from './database';
import {
  Sale,
  SaleItem,
  SaleWithItems,
  CreateSaleInput,
} from '../types/sale';

export async function getSales(sinceISO: string | null): Promise<Sale[]> {
  const db = await getDatabase();
  if (sinceISO === null) {
    return db.getAllAsync<Sale>('SELECT * FROM sales ORDER BY createdAt DESC');
  }
  return db.getAllAsync<Sale>(
    'SELECT * FROM sales WHERE createdAt >= ? ORDER BY createdAt DESC',
    sinceISO,
  );
}

export async function getSaleById(id: number): Promise<SaleWithItems | null> {
  const db = await getDatabase();
  const sale = await db.getFirstAsync<Sale>(
    'SELECT * FROM sales WHERE id = ?',
    id,
  );
  if (!sale) return null;
  const items = await db.getAllAsync<SaleItem>(
    'SELECT * FROM sale_items WHERE saleId = ? ORDER BY id ASC',
    id,
  );
  return { ...sale, items };
}

/**
 * Registra a venda E dá baixa no estoque na MESMA transação:
 * se qualquer item não tiver estoque, nada é gravado.
 */
export async function createSale(input: CreateSaleInput): Promise<number> {
  const db = await getDatabase();
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = Math.min(Math.max(input.discount, 0), subtotal);
  const total = subtotal - discount;
  let saleId = 0;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      `INSERT INTO sales (createdAt, total, discount, paymentMethod, status)
       VALUES (?, ?, ?, ?, 'concluida')`,
      new Date().toISOString(),
      total,
      discount,
      input.paymentMethod,
    );
    saleId = result.lastInsertRowId;

    for (const item of input.items) {
      const update = await db.runAsync(
        'UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
        item.quantity,
        item.productId,
        item.quantity,
      );
      if (update.changes === 0) {
        throw new Error(`Estoque insuficiente para "${item.productName}".`);
      }
      await db.runAsync(
        `INSERT INTO sale_items (saleId, productId, productName, quantity, unitPrice, unitCost)
         VALUES (?, ?, ?, ?, ?, ?)`,
        saleId,
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.unitCost,
      );
    }
  });

  return saleId;
}

/** Estorna a venda: marca como cancelada e devolve os itens ao estoque. */
export async function cancelSale(id: number): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const sale = await db.getFirstAsync<Sale>(
      'SELECT * FROM sales WHERE id = ?',
      id,
    );
    if (!sale) throw new Error('Venda não encontrada.');
    if (sale.status === 'cancelada') throw new Error('Venda já cancelada.');

    const items = await db.getAllAsync<SaleItem>(
      'SELECT * FROM sale_items WHERE saleId = ?',
      id,
    );
    for (const item of items) {
      if (item.productId !== null) {
        await db.runAsync(
          'UPDATE products SET quantity = quantity + ? WHERE id = ?',
          item.quantity,
          item.productId,
        );
      }
    }
    await db.runAsync("UPDATE sales SET status = 'cancelada' WHERE id = ?", id);
  });
}

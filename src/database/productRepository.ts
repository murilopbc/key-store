import { getDatabase } from './database';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../types/product';

export async function getProducts(): Promise<Product[]> {
  const db = await getDatabase();
  return db.getAllAsync<Product>('SELECT * FROM products ORDER BY name ASC');
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', id);
}

export async function getProductByBarcode(
  barcode: string,
): Promise<Product | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Product>(
    'SELECT * FROM products WHERE barcode = ?',
    barcode,
  );
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const db = await getDatabase();
  const placeholders = ids.map(() => '?').join(', ');
  return db.getAllAsync<Product>(
    `SELECT * FROM products WHERE id IN (${placeholders})`,
    ...ids,
  );
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO products
       (name, category, model, barcode, costPrice, salePrice, quantity, minStock, photoUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.name,
    input.category,
    input.model,
    input.barcode,
    input.costPrice,
    input.salePrice,
    input.quantity,
    input.minStock,
    input.photoUri,
    new Date().toISOString(),
  );
  const created = await getProductById(result.lastInsertRowId);
  if (!created) throw new Error('Não foi possível recuperar o produto criado.');
  return created;
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE products
        SET name = ?, category = ?, model = ?, barcode = ?, costPrice = ?,
            salePrice = ?, quantity = ?, minStock = ?, photoUri = ?
      WHERE id = ?`,
    input.name,
    input.category,
    input.model,
    input.barcode,
    input.costPrice,
    input.salePrice,
    input.quantity,
    input.minStock,
    input.photoUri,
    id,
  );
}

/** Soma `delta` ao estoque (negativo = saída). Nunca deixa ficar abaixo de zero. */
export async function adjustQuantity(id: number, delta: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE products SET quantity = MAX(0, quantity + ?) WHERE id = ?',
    delta,
    id,
  );
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM products WHERE id = ?', id);
}

export async function countProducts(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM products',
  );
  return row?.count ?? 0;
}

export async function countLowStock(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM products WHERE quantity <= minStock',
  );
  return row?.count ?? 0;
}

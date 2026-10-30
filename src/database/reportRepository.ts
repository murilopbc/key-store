import { getDatabase } from './database';
import { PeriodSummary, TopProduct } from '../types/sale';

const EPOCH = '0000-01-01T00:00:00.000Z';

export async function getSummary(
  sinceISO: string | null,
): Promise<PeriodSummary> {
  const db = await getDatabase();
  const since = sinceISO ?? EPOCH;

  const totals = await db.getFirstAsync<{ total: number; count: number }>(
    `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS count
       FROM sales WHERE status = 'concluida' AND createdAt >= ?`,
    since,
  );
  const costRow = await db.getFirstAsync<{ cost: number }>(
    `SELECT COALESCE(SUM(si.quantity * si.unitCost), 0) AS cost
       FROM sale_items si JOIN sales s ON s.id = si.saleId
      WHERE s.status = 'concluida' AND s.createdAt >= ?`,
    since,
  );

  const total = totals?.total ?? 0;
  const cost = costRow?.cost ?? 0;
  return { total, count: totals?.count ?? 0, cost, profit: total - cost };
}

export async function getCompletedSalesSince(
  sinceISO: string,
): Promise<{ createdAt: string; total: number }[]> {
  const db = await getDatabase();
  return db.getAllAsync<{ createdAt: string; total: number }>(
    `SELECT createdAt, total FROM sales
      WHERE status = 'concluida' AND createdAt >= ?
      ORDER BY createdAt ASC`,
    sinceISO,
  );
}

export async function getTopProducts(
  sinceISO: string | null,
  limit = 5,
): Promise<TopProduct[]> {
  const db = await getDatabase();
  return db.getAllAsync<TopProduct>(
    `SELECT si.productName AS name,
            SUM(si.quantity) AS quantity,
            SUM(si.quantity * si.unitPrice) AS revenue
       FROM sale_items si JOIN sales s ON s.id = si.saleId
      WHERE s.status = 'concluida' AND s.createdAt >= ?
      GROUP BY si.productName
      ORDER BY quantity DESC
      LIMIT ?`,
    sinceISO ?? EPOCH,
    limit,
  );
}

import { startOfDay, daysAgoFromToday, monthsAgoFromToday } from './dates';

export type Granularity = 'day' | 'week' | 'month';

export interface Bucket {
  label: string;
  total: number;
  count: number;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const SIZE: Record<Granularity, number> = { day: 7, week: 4, month: 6 };

function dayLabel(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Início da janela do relatório (ISO). */
export function windowStartISO(g: Granularity): string {
  if (g === 'day') return startOfDay(6).toISOString();
  if (g === 'week') return startOfDay(27).toISOString();
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
}

export function buildBuckets(
  g: Granularity,
  sales: { createdAt: string; total: number }[],
): Bucket[] {
  const size = SIZE[g];
  const now = new Date();
  const buckets: Bucket[] = Array.from({ length: size }, (_, i) => {
    let label: string;
    if (g === 'day') label = dayLabel(startOfDay(size - 1 - i));
    else if (g === 'week') label = dayLabel(startOfDay((size - 1 - i) * 7 + 6));
    else label = MONTHS[new Date(now.getFullYear(), now.getMonth() - (size - 1 - i), 1).getMonth()];
    return { label, total: 0, count: 0 };
  });

  for (const sale of sales) {
    let index: number;
    if (g === 'day') index = size - 1 - daysAgoFromToday(sale.createdAt);
    else if (g === 'week') index = size - 1 - Math.floor(daysAgoFromToday(sale.createdAt) / 7);
    else index = size - 1 - monthsAgoFromToday(sale.createdAt);

    if (index >= 0 && index < size) {
      buckets[index].total += sale.total;
      buckets[index].count += 1;
    }
  }
  return buckets;
}

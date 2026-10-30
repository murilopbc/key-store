import { PeriodFilter } from '../types/sale';

/** Meia-noite (horário local) de `daysAgo` dias atrás. */
export function startOfDay(daysAgo = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export function periodStartISO(period: PeriodFilter): string | null {
  switch (period) {
    case 'today':
      return startOfDay(0).toISOString();
    case 'week':
      return startOfDay(6).toISOString();
    case 'month':
      return startOfDay(29).toISOString();
    default:
      return null;
  }
}

/** Quantos dias (calendário local) separam `iso` de hoje. */
export function daysAgoFromToday(iso: string): number {
  const d = new Date(iso);
  const t = new Date();
  const a = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((a - b) / 86_400_000);
}

export function monthsAgoFromToday(iso: string): number {
  const d = new Date(iso);
  const t = new Date();
  return (t.getFullYear() - d.getFullYear()) * 12 + (t.getMonth() - d.getMonth());
}

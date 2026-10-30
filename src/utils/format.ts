export function formatCurrency(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const [int, dec] = Math.abs(rounded).toFixed(2).split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${rounded < 0 ? '-' : ''}R$ ${withDots},${dec}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

/** Aceita "12,50", "12.50" e "1.250,50". Devolve 0 se não for número. */
export function parseMoney(text: string): number {
  let t = text.trim().replace(/[^\d.,-]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

export function parseInteger(text: string): number {
  const n = parseInt(text.trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

export function moneyToInput(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

export const PAYMENT_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  debito: 'Débito',
  credito: 'Crédito',
};

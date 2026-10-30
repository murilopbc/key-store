import { SaleWithItems } from '../types/sale';
import { formatCurrency, formatDateTime, PAYMENT_LABELS } from './format';

/** Texto do recibo, pronto para Share (WhatsApp, e-mail...). */
export function buildReceipt(sale: SaleWithItems, storeName: string): string {
  const lines = [
    `*${storeName || 'Loja de Chaves'}*`,
    `Recibo da venda #${sale.id}`,
    formatDateTime(sale.createdAt),
    '--------------------------------',
    ...sale.items.map(
      (i) =>
        `${i.quantity}x ${i.productName}  ${formatCurrency(i.unitPrice * i.quantity)}`,
    ),
    '--------------------------------',
  ];
  if (sale.discount > 0) lines.push(`Desconto: -${formatCurrency(sale.discount)}`);
  lines.push(`*TOTAL: ${formatCurrency(sale.total)}*`);
  lines.push(`Pagamento: ${PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}`);
  if (sale.status === 'cancelada') lines.push('⚠️ VENDA CANCELADA');
  lines.push('', 'Obrigado pela preferência!');
  return lines.join('\n');
}

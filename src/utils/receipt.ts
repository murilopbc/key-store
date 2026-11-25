import { SaleWithItems } from '../types/sale';
import { UserProfile } from '../types/profile';
import { formatCurrency, formatDateTime, formatPhone, PAYMENT_LABELS } from './format';
import { formatCnpj } from './cnpj';

export type ReceiptStore = Pick<UserProfile, 'storeName' | 'cnpj' | 'address' | 'phone'>;

/** Cabeçalho com os dados da loja; linhas vazias são omitidas. */
function storeHeader(store: ReceiptStore | null): string[] {
  const lines = [`*${store?.storeName || 'Loja de Chaves'}*`];
  if (store?.cnpj) lines.push(`CNPJ ${formatCnpj(store.cnpj)}`);
  if (store?.address) lines.push(store.address);
  if (store?.phone) lines.push(`Tel. ${formatPhone(store.phone)}`);
  return lines;
}

/** Texto do recibo, pronto para Share (WhatsApp, e-mail...). */
export function buildReceipt(sale: SaleWithItems, store: ReceiptStore | null): string {
  const lines = [
    ...storeHeader(store),
    '',
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

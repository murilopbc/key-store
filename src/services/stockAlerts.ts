import * as ProductRepository from '../database/productRepository';
import * as NotificationRepository from '../database/notificationRepository';
import { sendLocalNotification } from './notificationService';

/**
 * Depois de qualquer saída de estoque, avisa sobre os produtos que
 * ficaram no mínimo (ou zerados): grava na lista e dispara notificação.
 */
export async function checkStockAlerts(productIds: number[]): Promise<void> {
  const products = await ProductRepository.getProductsByIds(productIds);

  for (const p of products) {
    if (p.quantity > p.minStock) continue;
    const title = p.quantity === 0 ? 'Estoque zerado' : 'Estoque baixo';
    const message = `${p.name}: restam ${p.quantity} un. (mínimo ${p.minStock}).`;
    await NotificationRepository.createNotification({ title, message, type: 'stock' });
    await sendLocalNotification(title, message);
  }
}

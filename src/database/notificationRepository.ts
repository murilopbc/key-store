import { getDatabase } from './database';
import { AppNotification, CreateNotificationInput } from '../types/notification';

export async function getNotifications(): Promise<AppNotification[]> {
  const db = await getDatabase();
  return db.getAllAsync<AppNotification>(
    'SELECT * FROM notifications ORDER BY createdAt DESC, id DESC',
  );
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO notifications (title, message, type, read, createdAt) VALUES (?, ?, ?, 0, ?)',
    input.title,
    input.message,
    input.type,
    new Date().toISOString(),
  );
}

export async function markAsRead(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE notifications SET read = 1 WHERE id = ?', id);
}

export async function markAllAsRead(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE notifications SET read = 1 WHERE read = 0');
}

export async function deleteAllNotifications(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notifications');
}

export async function countUnread(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM notifications WHERE read = 0',
  );
  return row?.count ?? 0;
}

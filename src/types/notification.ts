export type NotificationType = 'stock' | 'order' | 'goal' | 'info';

// "AppNotification" para não conflitar com o tipo global Notification
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: number; // 0 ou 1 — SQLite não tem booleano
  createdAt: string;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
}

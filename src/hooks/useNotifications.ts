import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import * as NotificationRepository from '../database/notificationRepository';
import { requestNotificationPermission } from '../services/notificationService';
import { AppNotification } from '../types/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setNotifications(await NotificationRepository.getNotifications());
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.read === 0).length,
    [notifications],
  );

  const markAsRead = useCallback(
    async (id: number) => {
      await NotificationRepository.markAsRead(id);
      await load();
    },
    [load],
  );

  const markAllAsRead = useCallback(async () => {
    await NotificationRepository.markAllAsRead();
    await load();
  }, [load]);

  const clearAll = useCallback(async () => {
    await NotificationRepository.deleteAllNotifications();
    await load();
  }, [load]);

  const enablePush = useCallback(() => requestNotificationPermission(), []); // 'granted' | 'denied' | 'unavailable'

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, clearAll, enablePush };
}

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ReportRepository from '../database/reportRepository';
import * as ProductRepository from '../database/productRepository';
import * as NotificationRepository from '../database/notificationRepository';
import { periodStartISO } from '../utils/dates';
import { PeriodSummary } from '../types/sale';

const EMPTY: PeriodSummary = { total: 0, count: 0, cost: 0, profit: 0 };

export function useDashboard() {
  const [today, setToday] = useState<PeriodSummary>(EMPTY);
  const [lowStock, setLowStock] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [summary, low, unreadCount] = await Promise.all([
        ReportRepository.getSummary(periodStartISO('today')),
        ProductRepository.countLowStock(),
        NotificationRepository.countUnread(),
      ]);
      setToday(summary);
      setLowStock(low);
      setUnread(unreadCount);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { today, lowStock, unread, loading };
}

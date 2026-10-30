import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SaleRepository from '../database/saleRepository';
import { periodStartISO } from '../utils/dates';
import { Sale, PeriodFilter } from '../types/sale';

export function useSales(initialPeriod: PeriodFilter = 'today') {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>(initialPeriod);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setSales(await SaleRepository.getSales(periodStartISO(period)));
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [loadSales]),
  );

  const totalCompleted = useMemo(
    () => sales.filter((s) => s.status === 'concluida').reduce((sum, s) => sum + s.total, 0),
    [sales],
  );

  return { sales, loading, period, setPeriod, totalCompleted };
}

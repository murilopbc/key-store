import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ReportRepository from '../database/reportRepository';
import { buildBuckets, windowStartISO, Granularity, Bucket } from '../utils/reportBuckets';
import { PeriodSummary, TopProduct } from '../types/sale';

const EMPTY: PeriodSummary = { total: 0, count: 0, cost: 0, profit: 0 };

export function useReports() {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [summary, setSummary] = useState<PeriodSummary>(EMPTY);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const since = windowStartISO(granularity);
      const [sum, sales, top] = await Promise.all([
        ReportRepository.getSummary(since),
        ReportRepository.getCompletedSalesSince(since),
        ReportRepository.getTopProducts(since, 5),
      ]);
      setSummary(sum);
      setBuckets(buildBuckets(granularity, sales));
      setTopProducts(top);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  }, [granularity]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { granularity, setGranularity, summary, buckets, topProducts, loading };
}

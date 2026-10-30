import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SaleRepository from '../database/saleRepository';
import { SaleWithItems } from '../types/sale';

export function useSale(id: number | undefined) {
  const [sale, setSale] = useState<SaleWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (id === undefined) {
      setLoading(false);
      return;
    }
    try {
      setSale(await SaleRepository.getSaleById(id));
    } catch (error) {
      console.error('Erro ao carregar venda:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const cancel = useCallback(async () => {
    if (id === undefined) return;
    await SaleRepository.cancelSale(id);
    await load();
  }, [id, load]);

  return { sale, loading, cancel };
}

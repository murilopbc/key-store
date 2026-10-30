import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ProductRepository from '../database/productRepository';
import { checkStockAlerts } from '../services/stockAlerts';
import { deletePhoto } from '../services/fileService';
import { Product, CreateProductInput } from '../types/product';

/** Um produto só: serve para a tela de detalhe e para o formulário (criar/editar). */
export function useProduct(id?: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(id !== undefined);

  const load = useCallback(async () => {
    if (id === undefined) {
      setLoading(false);
      return;
    }
    try {
      setProduct(await ProductRepository.getProductById(id));
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = useCallback(
    async (input: CreateProductInput): Promise<number> => {
      if (id !== undefined) {
        const previous = product;
        await ProductRepository.updateProduct(id, input);
        if (previous && previous.photoUri && previous.photoUri !== input.photoUri) {
          deletePhoto(previous.photoUri);
        }
        if (previous && input.quantity < previous.quantity) await checkStockAlerts([id]);
        return id;
      }
      const created = await ProductRepository.createProduct(input);
      await checkStockAlerts([created.id]);
      return created.id;
    },
    [id, product],
  );

  /** delta > 0 = entrada de mercadoria; delta < 0 = saída. */
  const adjust = useCallback(
    async (delta: number) => {
      if (id === undefined) return;
      await ProductRepository.adjustQuantity(id, delta);
      await load();
      if (delta < 0) await checkStockAlerts([id]);
    },
    [id, load],
  );

  const remove = useCallback(async () => {
    if (id === undefined || !product) return;
    await ProductRepository.deleteProduct(id);
    deletePhoto(product.photoUri);
  }, [id, product]);

  return { product, loading, save, adjust, remove, reload: load };
}

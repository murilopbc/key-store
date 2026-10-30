import { useCallback } from 'react';
import * as ProductRepository from '../database/productRepository';
import { Product } from '../types/product';

/** Busca um produto pelo código de barras lido pela câmera. */
export function useProductLookup() {
  const findByBarcode = useCallback(
    (barcode: string): Promise<Product | null> =>
      ProductRepository.getProductByBarcode(barcode.trim()),
    [],
  );
  return { findByBarcode };
}

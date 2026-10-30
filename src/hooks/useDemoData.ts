import { useCallback } from 'react';
import * as ProductRepository from '../database/productRepository';

const DEMO = [
  ['Chave Yale Simples', 'Chave simples', 'Yale 22', '7891000000011', 2.5, 8, 40],
  ['Chave Tetra Pado', 'Chave tetra', 'Tetra T-60', '7891000000028', 4, 14, 25],
  ['Chave Canivete Fiat', 'Chave canivete', 'Fiat Uno', '7891000000035', 28, 85, 6],
  ['Telecomando Gol G5', 'Telecomando', 'VW G5 3 botões', '7891000000042', 55, 140, 4],
  ['Chave Codificada Honda', 'Chave codificada', 'Civic 2012', '7891000000059', 70, 190, 3],
  ['Cadeado Latão 40mm', 'Cadeado', 'Papaiz 40', '7891000000066', 12, 32, 15],
  ['Chave Gorje', 'Chave simples', 'Gorje 11', '7891000000073', 3, 9, 3],
] as const;

export function useDemoData() {
  /** Cadastra produtos de exemplo. Só roda se o catálogo estiver vazio. */
  const loadDemoProducts = useCallback(async (): Promise<number> => {
    if ((await ProductRepository.countProducts()) > 0) return 0;
    for (const [name, category, model, barcode, costPrice, salePrice, quantity] of DEMO) {
      await ProductRepository.createProduct({
        name,
        category,
        model,
        barcode,
        costPrice,
        salePrice,
        quantity,
        minStock: 5,
        photoUri: null,
      });
    }
    return DEMO.length;
  }, []);

  return { loadDemoProducts };
}

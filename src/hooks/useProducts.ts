import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ProductRepository from '../database/productRepository';
import { deletePhoto } from '../services/fileService';
import { Product, StockFilter } from '../types/product';

export function useProducts(initialFilter: StockFilter = 'all') {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockFilter>(initialFilter);
  const [category, setCategory] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await ProductRepository.getProducts());
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega toda vez que a tela ganha foco (ex.: volta do formulário).
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products],
  );

  // Filtramos na memória: instantâneo e permite mostrar os contadores.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === 'low' && p.quantity > p.minStock) return false;
      if (category && p.category !== category) return false;
      if (!term) return true;
      return [p.name, p.model, p.category, p.barcode ?? ''].some((v) =>
        v.toLowerCase().includes(term),
      );
    });
  }, [products, search, filter, category]);

  const counts = useMemo(
    () => ({
      all: products.length,
      low: products.filter((p) => p.quantity <= p.minStock).length,
    }),
    [products],
  );

  const removeProduct = useCallback(
    async (product: Product) => {
      await ProductRepository.deleteProduct(product.id);
      deletePhoto(product.photoUri);
      await loadProducts();
    },
    [loadProducts],
  );

  return {
    products: filtered,
    allProducts: products,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    category,
    setCategory,
    categories,
    counts,
    removeProduct,
    reload: loadProducts,
  };
}

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProducts } from '../src/hooks/useProducts';
import { useProductLookup } from '../src/hooks/useProductLookup';
import { ProductItem } from '../src/components/ProductItem';
import { FilterBar } from '../src/components/FilterBar';
import { EmptyState } from '../src/components/EmptyState';
import { BarcodeScanner } from '../src/components/BarcodeScanner';
import { colors } from '../src/theme';
import { Product, StockFilter } from '../src/types/product';

export default function Estoque() {
  const router = useRouter();
  const { filter: filterParam } = useLocalSearchParams<{ filter?: string }>();
  const {
    products,
    allProducts,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    category,
    setCategory,
    categories,
    counts,
  } = useProducts(filterParam === 'low' ? 'low' : 'all');
  const { findByBarcode } = useProductLookup();
  const [showScanner, setShowScanner] = useState(false);

  async function handleScan(code: string) {
    setShowScanner(false);
    const product = await findByBarcode(code);
    if (product) {
      // Entrada de mercadoria: a tela de detalhe tem os botões de entrada/saída.
      router.push(`/produto?id=${product.id}`);
      return;
    }
    Alert.alert('Produto não encontrado', `O código ${code} ainda não está cadastrado.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cadastrar',
        onPress: () => router.push(`/produto-form?barcode=${encodeURIComponent(code)}`),
      },
    ]);
  }

  if (showScanner) {
    return (
      <BarcodeScanner
        title="Entrada de mercadoria: escaneie o produto"
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  const stockOptions: { key: StockFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'low', label: 'Estoque baixo', count: counts.low },
  ];

  const categoryOptions = [
    { key: '__all__', label: 'Todas as categorias' },
    ...categories.map((c) => ({ key: c, label: c })),
  ];

  return (
    <View className="flex-1 p-4">
      <View className="flex-row gap-2 mb-3">
        <TextInput
          className="flex-1 bg-white border border-stone-300 rounded-lg p-3"
          placeholder="Buscar por nome, modelo ou código..."
          placeholderTextColor="#a8a29e"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          className="bg-slate-800 rounded-lg px-4 items-center justify-center"
          onPress={() => setShowScanner(true)}
        >
          <Text className="text-xl">📷</Text>
        </TouchableOpacity>
      </View>

      <FilterBar options={stockOptions} value={filter} onChange={setFilter} />
      {categories.length > 0 && (
        <FilterBar
          options={categoryOptions}
          value={category ?? '__all__'}
          onChange={(key) => setCategory(key === '__all__' ? null : key)}
        />
      )}

      {loading && allProducts.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} className="mt-10" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: Product }) => (
            <ProductItem
              product={item}
              onPress={(p) => router.push(`/produto?id=${p.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📦"
              title={allProducts.length === 0 ? 'Nenhum produto ainda' : 'Nada encontrado'}
              subtitle={
                allProducts.length === 0
                  ? 'Toque no + para cadastrar o primeiro.'
                  : 'Ajuste a busca ou os filtros.'
              }
            />
          }
          contentContainerClassName="pb-24"
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-16 h-16 bg-amber-700 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/produto-form')}
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}

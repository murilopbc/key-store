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
import { IconButton } from '../src/components/IconButton';
import { Icon } from '../src/components/Icon';
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
        <View className="flex-1 flex-row items-center bg-white border border-stone-300 rounded-xl px-3 h-12">
          <Icon name="search" size={18} color={colors.placeholder} />
          <TextInput
            className="flex-1 ml-2 text-base text-stone-900"
            placeholder="Buscar por nome, modelo ou código"
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Limpar busca" hitSlop={8}>
              <Icon name="close-circle" size={18} color={colors.placeholder} />
            </TouchableOpacity>
          ) : null}
        </View>
        <IconButton icon="barcode-outline" accessibilityLabel="Escanear código" onPress={() => setShowScanner(true)} />
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
              icon="cube-outline"
              title={allProducts.length === 0 ? 'Nenhum produto ainda' : 'Nada encontrado'}
              subtitle={
                allProducts.length === 0
                  ? 'Toque em "Novo produto" para cadastrar o primeiro.'
                  : 'Ajuste a busca ou os filtros.'
              }
            />
          }
          contentContainerClassName="pb-24"
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-5 flex-row items-center gap-2 bg-amber-700 rounded-full pl-4 pr-5 h-14 shadow-lg"
        onPress={() => router.push('/produto-form')}
        accessibilityRole="button"
      >
        <Icon name="add" size={24} color={colors.white} />
        <Text className="text-white font-bold text-base">Novo produto</Text>
      </TouchableOpacity>
    </View>
  );
}

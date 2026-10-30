import { useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProduct } from '../src/hooks/useProduct';
import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';
import { formatCurrency, parseInteger } from '../src/utils/format';
import { colors } from '../src/theme';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-stone-100">
      <Text className="text-stone-500">{label}</Text>
      <Text className="font-medium text-stone-900 flex-1 text-right ml-4">{value}</Text>
    </View>
  );
}

export default function ProdutoDetalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { product, loading, adjust, remove } = useProduct(id ? Number(id) : undefined);
  const [qtyText, setQtyText] = useState('1');

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!product) {
    return <EmptyState icon="❓" title="Produto não encontrado" />;
  }

  const qty = Math.max(parseInteger(qtyText), 0);
  const low = product.quantity <= product.minStock;
  const margin =
    product.salePrice > 0
      ? ((product.salePrice - product.costPrice) / product.salePrice) * 100
      : 0;

  async function handleAdjust(sign: 1 | -1) {
    if (qty <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade maior que zero.');
      return;
    }
    if (sign === -1 && product && qty > product.quantity) {
      Alert.alert('Atenção', 'A saída é maior que o estoque disponível.');
      return;
    }
    await adjust(sign * qty);
    setQtyText('1');
  }

  function handleDelete() {
    Alert.alert('Excluir produto', `Excluir "${product?.name}"? As vendas antigas são mantidas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await remove();
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerClassName="p-4 pb-10">
      <View className="items-center mb-4">
        {product.photoUri ? (
          <Image source={{ uri: product.photoUri }} className="w-48 h-48 rounded-2xl" />
        ) : (
          <View className="w-48 h-48 rounded-2xl bg-amber-50 items-center justify-center">
            <Text className="text-7xl">🔑</Text>
          </View>
        )}
        <Text className="text-2xl font-bold text-stone-900 mt-4 text-center">
          {product.name}
        </Text>
      </View>

      <View className="bg-white rounded-xl px-4 mb-4">
        <Row label="Categoria" value={product.category || '—'} />
        <Row label="Modelo" value={product.model || '—'} />
        <Row label="Código de barras" value={product.barcode ?? '—'} />
        <Row label="Preço de custo" value={formatCurrency(product.costPrice)} />
        <Row label="Preço de venda" value={formatCurrency(product.salePrice)} />
        <Row label="Margem" value={`${margin.toFixed(0)}%`} />
        <Row label="Estoque mínimo" value={`${product.minStock} un.`} />
      </View>

      <View className={`rounded-xl p-4 mb-4 ${low ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
        <Text className="text-xs uppercase tracking-wider text-stone-500">Em estoque</Text>
        <Text className="text-4xl font-bold text-stone-900">{product.quantity}</Text>
        {low && (
          <Text className="text-red-700 mt-1">
            {product.quantity === 0 ? 'Produto sem estoque.' : 'Estoque baixo: hora de repor.'}
          </Text>
        )}

        <Text className="text-sm text-stone-600 mt-4 mb-1">Ajustar quantidade</Text>
        <TextInput
          className="bg-white border border-stone-300 rounded-lg p-3 mb-3"
          keyboardType="number-pad"
          value={qtyText}
          onChangeText={setQtyText}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button title="+ Entrada" onPress={() => handleAdjust(1)} />
          </View>
          <View className="flex-1">
            <Button title="− Saída" variant="secondary" onPress={() => handleAdjust(-1)} />
          </View>
        </View>
      </View>

      <View className="gap-3">
        <Button
          title="Editar produto"
          variant="secondary"
          onPress={() => router.push(`/produto-form?id=${product.id}`)}
        />
        <Button title="Excluir produto" variant="danger" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

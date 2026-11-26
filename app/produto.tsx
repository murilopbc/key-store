import { useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProduct } from '../src/hooks/useProduct';
import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';
import { Card } from '../src/components/Card';
import { Icon } from '../src/components/Icon';
import { formatCurrency, parseInteger } from '../src/utils/format';
import { colors } from '../src/theme';

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row justify-between py-3 ${last ? '' : 'border-b border-stone-100'}`}>
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
    return <EmptyState icon="help-circle-outline" title="Produto não encontrado" />;
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
          <View className="w-48 h-48 rounded-2xl bg-amber-100 items-center justify-center">
            <Icon name="key-outline" size={80} color={colors.primary} />
          </View>
        )}
        <Text className="text-2xl font-bold text-stone-900 mt-4 text-center">
          {product.name}
        </Text>
        <Text className="text-xl font-bold text-amber-700 mt-1">
          {formatCurrency(product.salePrice)}
        </Text>
      </View>

      <Card className="p-4 mb-4" tone={low ? 'danger' : 'default'}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-medium text-stone-500">Em estoque</Text>
            <Text className={`text-4xl font-bold ${low ? 'text-red-700' : 'text-stone-900'}`}>
              {product.quantity}
              <Text className="text-base font-medium text-stone-500"> un.</Text>
            </Text>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${low ? 'bg-red-100' : 'bg-emerald-100'}`}>
            <Text className={`text-xs font-bold ${low ? 'text-red-700' : 'text-emerald-700'}`}>
              {product.quantity === 0 ? 'Sem estoque' : low ? 'Repor estoque' : 'Estoque ok'}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-semibold text-stone-700 mt-4 mb-1.5">Ajustar quantidade</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="w-20 bg-white border border-stone-300 rounded-xl px-3 text-center text-lg font-bold text-stone-900"
            keyboardType="number-pad"
            value={qtyText}
            onChangeText={setQtyText}
            accessibilityLabel="Quantidade a ajustar"
          />
          <View className="flex-1">
            <Button title="Entrada" icon="arrow-down-circle-outline" onPress={() => handleAdjust(1)} />
          </View>
          <View className="flex-1">
            <Button title="Saída" icon="arrow-up-circle-outline" variant="secondary" onPress={() => handleAdjust(-1)} />
          </View>
        </View>
      </Card>

      <Card className="px-4 mb-4">
        <Row label="Categoria" value={product.category || '—'} />
        <Row label="Modelo" value={product.model || '—'} />
        <Row label="Código de barras" value={product.barcode ?? '—'} />
        <Row label="Preço de custo" value={formatCurrency(product.costPrice)} />
        <Row label="Margem" value={`${margin.toFixed(0)}%`} />
        <Row label="Estoque mínimo" value={`${product.minStock} un.`} last />
      </Card>

      <View className="gap-3">
        <Button
          title="Editar produto"
          icon="create-outline"
          variant="secondary"
          onPress={() => router.push(`/produto-form?id=${product.id}`)}
        />
        <Button title="Excluir produto" icon="trash-outline" variant="danger" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

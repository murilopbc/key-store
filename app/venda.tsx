import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart, type AddResult } from '../src/hooks/useCart';
import { useProducts } from '../src/hooks/useProducts';
import { ProductItem } from '../src/components/ProductItem';
import { FilterBar } from '../src/components/FilterBar';
import { EmptyState } from '../src/components/EmptyState';
import { BarcodeScanner } from '../src/components/BarcodeScanner';
import { Button } from '../src/components/Button';
import { formatCurrency } from '../src/utils/format';
import { PaymentMethod } from '../src/types/sale';

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string }[] = [
  { key: 'dinheiro', label: 'Dinheiro' },
  { key: 'pix', label: 'Pix' },
  { key: 'debito', label: 'Débito' },
  { key: 'credito', label: 'Crédito' },
];

export default function NovaVenda() {
  const router = useRouter();
  const cart = useCart();
  const { products, search, setSearch } = useProducts();
  const [showScanner, setShowScanner] = useState(false);

  const searching = search.trim().length > 0;
  const results = products.filter((p) => p.quantity > 0).slice(0, 20);

  function notify(result: AddResult) {
    if (result === 'no_stock') {
      Alert.alert('Sem estoque', 'Todo o estoque disponível deste item já está no carrinho.');
    } else if (result === 'not_found') {
      Alert.alert('Não encontrado', 'Este código de barras não está cadastrado.');
    }
  }

  async function handleScan(code: string) {
    setShowScanner(false);
    notify(await cart.addByBarcode(code));
  }

  async function handleFinalize() {
    try {
      const saleId = await cart.finalize();
      // replace: o botão voltar não deve reabrir uma venda já concluída
      router.replace(`/venda-detalhe?id=${saleId}`);
    } catch (error) {
      Alert.alert('Não foi possível finalizar', (error as Error).message);
    }
  }

  if (showScanner) {
    return (
      <BarcodeScanner
        title="Escaneie o item para adicionar"
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="p-4 pb-0">
        <View className="flex-row gap-2 mb-3">
          <TextInput
            className="flex-1 bg-white border border-stone-300 rounded-lg p-3"
            placeholder="Buscar produto para adicionar..."
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
      </View>

      <View className="flex-1 px-4">
        {searching ? (
          <FlatList
            data={results}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ProductItem
                product={item}
                actionLabel="+ Adicionar"
                onPress={(p) => {
                  const result = cart.addProduct(p);
                  notify(result);
                  if (result === 'added') setSearch('');
                }}
              />
            )}
            ListEmptyComponent={<EmptyState icon="🔍" title="Nenhum item com estoque" />}
          />
        ) : (
          <FlatList
            data={cart.items}
            keyExtractor={(item) => String(item.product.id)}
            renderItem={({ item }) => (
              <View className="bg-white rounded-xl p-3 mb-2">
                <View className="flex-row justify-between">
                  <Text className="font-bold text-stone-900 flex-1" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity onPress={() => cart.removeItem(item.product.id)}>
                    <Text className="text-red-600 font-bold">✕</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-stone-500">
                  {formatCurrency(item.product.salePrice)} cada · {item.product.quantity} em estoque
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      className="w-9 h-9 rounded-full bg-stone-200 items-center justify-center"
                      onPress={() => cart.changeQuantity(item.product.id, -1)}
                    >
                      <Text className="text-xl">−</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold w-8 text-center">{item.quantity}</Text>
                    <TouchableOpacity
                      className="w-9 h-9 rounded-full bg-stone-200 items-center justify-center"
                      onPress={() => cart.changeQuantity(item.product.id, 1)}
                    >
                      <Text className="text-xl">+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="font-bold text-amber-700">
                    {formatCurrency(item.product.salePrice * item.quantity)}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <EmptyState
                icon="🛒"
                title="Carrinho vazio"
                subtitle="Busque um produto ou escaneie o código de barras."
              />
            }
          />
        )}
      </View>

      <View className="bg-white p-4 border-t border-stone-200">
        <FilterBar
          options={PAYMENT_OPTIONS}
          value={cart.paymentMethod}
          onChange={cart.setPaymentMethod}
        />

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-stone-600">Desconto (R$)</Text>
          <TextInput
            className="bg-stone-100 rounded-lg px-3 py-2 w-28 text-right"
            placeholder="0,00"
            placeholderTextColor="#a8a29e"
            keyboardType="decimal-pad"
            value={cart.discountText}
            onChangeText={cart.setDiscountText}
          />
        </View>

        <View className="flex-row justify-between mb-3">
          <Text className="text-stone-600">Total</Text>
          <Text className="text-2xl font-bold text-stone-900">{formatCurrency(cart.total)}</Text>
        </View>

        <Button
          title="Finalizar venda"
          onPress={handleFinalize}
          disabled={cart.items.length === 0}
          loading={cart.saving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
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
import { IconButton } from '../src/components/IconButton';
import { Icon } from '../src/components/Icon';
import { Button } from '../src/components/Button';
import { formatCurrency } from '../src/utils/format';
import { colors } from '../src/theme';
import { PaymentMethod } from '../src/types/sale';

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string }[] = [
  { key: 'dinheiro', label: 'Dinheiro' },
  { key: 'pix', label: 'Pix' },
  { key: 'debito', label: 'Débito' },
  { key: 'credito', label: 'Crédito' },
];

function QtyButton({ icon, onPress, label }: { icon: 'add' | 'remove'; onPress: () => void; label: string }) {
  return (
    <TouchableOpacity
      className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 items-center justify-center"
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={6}
    >
      <Icon name={icon} size={18} color={colors.text} />
    </TouchableOpacity>
  );
}

export default function NovaVenda() {
  const router = useRouter();
  const cart = useCart();
  const { products, allProducts, search, setSearch } = useProducts();
  const [showScanner, setShowScanner] = useState(false);
  const [cartOpen, setCartOpen] = useState(true);

  // Lista visível desde o início: só itens com estoque; a busca filtra.
  const available = products.filter((p) => p.quantity > 0);
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const inCart = (productId: number) =>
    cart.items.find((i) => i.product.id === productId)?.quantity ?? 0;

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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* 1. Busca + leitor */}
      <View className="flex-row gap-2 p-4 pb-2">
        <View className="flex-1 flex-row items-center bg-white border border-stone-300 rounded-xl px-3 h-12">
          <Icon name="search" size={18} color={colors.placeholder} />
          <TextInput
            className="flex-1 ml-2 text-base text-stone-900"
            placeholder="Filtrar produtos"
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
        <IconButton icon="barcode-outline" accessibilityLabel="Escanear item" onPress={() => setShowScanner(true)} />
      </View>
      <Text className="px-4 pb-2 text-xs text-stone-500">
        Toque em um produto para adicioná-lo ao carrinho.
      </Text>

      {/* 2. Produtos disponíveis */}
      <FlatList
        className="flex-1 px-4"
        data={available}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const qty = inCart(item.id);
          return (
            <ProductItem
              product={item}
              actionLabel={qty > 0 ? `${qty} no carrinho` : 'Adicionar'}
              actionIcon={qty > 0 ? 'checkmark-circle' : 'add-circle'}
              onPress={(p) => notify(cart.addProduct(p))}
            />
          );
        }}
        ListEmptyComponent={
          allProducts.length === 0 ? (
            <EmptyState
              icon="cube-outline"
              title="Nenhum produto cadastrado"
              subtitle="Cadastre produtos ou carregue os de exemplo no Perfil."
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title={search ? 'Nada encontrado' : 'Nenhum item com estoque'}
              subtitle={search ? 'Tente outro nome ou escaneie o código.' : 'Dê entrada no estoque para vender.'}
            />
          )
        }
        contentContainerClassName="pb-4"
      />

      {/* 3. Carrinho fixo embaixo */}
      <View className="bg-white border-t border-stone-200 rounded-t-3xl px-4 pt-3 pb-4 shadow-lg">
        <TouchableOpacity
          className="flex-row items-center justify-between mb-2"
          onPress={() => setCartOpen((v) => !v)}
          disabled={cart.items.length === 0}
          accessibilityRole="button"
          accessibilityLabel={cartOpen ? 'Recolher carrinho' : 'Expandir carrinho'}
        >
          <View className="flex-row items-center gap-2">
            <Icon name="cart-outline" size={20} color={colors.text} />
            <Text className="font-bold text-stone-900 text-base">
              Carrinho{itemCount > 0 ? ` · ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : ''}
            </Text>
          </View>
          {cart.items.length > 0 ? (
            <Icon name={cartOpen ? 'chevron-down' : 'chevron-up'} size={20} color={colors.textMuted} />
          ) : null}
        </TouchableOpacity>

        {cart.items.length === 0 ? (
          <Text className="text-sm text-stone-500 mb-3">Vazio por enquanto.</Text>
        ) : cartOpen ? (
          <ScrollView className="max-h-40 mb-2" nestedScrollEnabled>
            {cart.items.map((item) => (
              <View key={item.product.id} className="flex-row items-center py-2 border-b border-stone-100">
                <View className="flex-1 pr-2">
                  <Text className="font-semibold text-stone-900" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text className="text-xs text-stone-500">
                    {formatCurrency(item.product.salePrice)} cada
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <QtyButton icon="remove" label="Diminuir" onPress={() => cart.changeQuantity(item.product.id, -1)} />
                  <Text className="text-base font-bold w-6 text-center">{item.quantity}</Text>
                  <QtyButton icon="add" label="Aumentar" onPress={() => cart.changeQuantity(item.product.id, 1)} />
                </View>
                <Text className="font-bold text-stone-900 w-20 text-right">
                  {formatCurrency(item.product.salePrice * item.quantity)}
                </Text>
                <TouchableOpacity
                  className="ml-2"
                  onPress={() => cart.removeItem(item.product.id)}
                  accessibilityLabel={`Remover ${item.product.name}`}
                  hitSlop={8}
                >
                  <Icon name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {cart.items.length > 0 && (
          <>
            <FilterBar
              options={PAYMENT_OPTIONS}
              value={cart.paymentMethod}
              onChange={cart.setPaymentMethod}
            />
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-stone-600">Desconto (R$)</Text>
              <TextInput
                className="bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 w-28 text-right text-stone-900"
                placeholder="0,00"
                placeholderTextColor={colors.placeholder}
                keyboardType="decimal-pad"
                value={cart.discountText}
                onChangeText={cart.setDiscountText}
              />
            </View>
          </>
        )}

        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-stone-600 text-base">Total</Text>
          <Text className="text-2xl font-bold text-stone-900">{formatCurrency(cart.total)}</Text>
        </View>

        <Button
          title="Finalizar venda"
          icon="checkmark-circle-outline"
          onPress={handleFinalize}
          disabled={cart.items.length === 0}
          loading={cart.saving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

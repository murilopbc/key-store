import { View, Text, ScrollView, Alert, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSale } from '../src/hooks/useSale';
import { useProfile } from '../src/hooks/useProfile';
import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';
import { buildReceipt } from '../src/utils/receipt';
import { formatCurrency, formatDateTime, PAYMENT_LABELS } from '../src/utils/format';
import { colors } from '../src/theme';

export default function VendaDetalhe() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { sale, loading, cancel } = useSale(id ? Number(id) : undefined);
  const { profile } = useProfile();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!sale) return <EmptyState icon="❓" title="Venda não encontrada" />;

  const current = sale;

  async function handleShare() {
    await Share.share({ message: buildReceipt(current, profile) });
  }

  function handleCancel() {
    Alert.alert(
      'Cancelar venda',
      'Os itens voltam para o estoque e a venda sai dos relatórios. Continuar?',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar venda',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancel();
            } catch (error) {
              Alert.alert('Erro', (error as Error).message);
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView contentContainerClassName="p-4 pb-10">
      <View className="bg-white rounded-xl p-4 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-xl font-bold text-stone-900">Venda #{current.id}</Text>
          {current.status === 'cancelada' && (
            <View className="bg-red-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-red-700">Cancelada</Text>
            </View>
          )}
        </View>
        <Text className="text-stone-500">{formatDateTime(current.createdAt)}</Text>
        <Text className="text-stone-500">
          Pagamento: {PAYMENT_LABELS[current.paymentMethod] ?? current.paymentMethod}
        </Text>
      </View>

      <View className="bg-white rounded-xl px-4 mb-4">
        {current.items.map((item) => (
          <View key={item.id} className="flex-row justify-between py-3 border-b border-stone-100">
            <View className="flex-1 pr-3">
              <Text className="font-medium text-stone-900">{item.productName}</Text>
              <Text className="text-xs text-stone-500">
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </Text>
            </View>
            <Text className="font-bold text-stone-900">
              {formatCurrency(item.quantity * item.unitPrice)}
            </Text>
          </View>
        ))}
        {current.discount > 0 && (
          <View className="flex-row justify-between py-3">
            <Text className="text-stone-500">Desconto</Text>
            <Text className="text-red-600">-{formatCurrency(current.discount)}</Text>
          </View>
        )}
        <View className="flex-row justify-between py-3">
          <Text className="text-lg font-bold">Total</Text>
          <Text className="text-lg font-bold text-amber-700">{formatCurrency(current.total)}</Text>
        </View>
      </View>

      <View className="gap-3">
        <Button title="Compartilhar recibo (WhatsApp, e-mail...)" onPress={handleShare} />
        {current.status === 'concluida' && (
          <Button title="Cancelar / estornar venda" variant="danger" onPress={handleCancel} />
        )}
      </View>
    </ScrollView>
  );
}

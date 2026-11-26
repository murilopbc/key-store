import { View, Text, ScrollView, Alert, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSale } from '../src/hooks/useSale';
import { useProfile } from '../src/hooks/useProfile';
import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';
import { Card } from '../src/components/Card';
import { Icon } from '../src/components/Icon';
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
  if (!sale) return <EmptyState icon="help-circle-outline" title="Venda não encontrada" />;

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
      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-bold text-stone-900">Venda #{current.id}</Text>
          <View className={`px-3 py-1 rounded-full ${current.status === 'cancelada' ? 'bg-red-100' : 'bg-emerald-100'}`}>
            <Text className={`text-xs font-bold ${current.status === 'cancelada' ? 'text-red-700' : 'text-emerald-700'}`}>
              {current.status === 'cancelada' ? 'Cancelada' : 'Concluída'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="calendar-outline" size={14} color={colors.textMuted} />
          <Text className="text-stone-500">{formatDateTime(current.createdAt)}</Text>
        </View>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Icon name="card-outline" size={14} color={colors.textMuted} />
          <Text className="text-stone-500">
            {PAYMENT_LABELS[current.paymentMethod] ?? current.paymentMethod}
          </Text>
        </View>
      </Card>

      <Card className="px-4 mb-4">
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
          <Text className="text-xl font-bold text-amber-700">{formatCurrency(current.total)}</Text>
        </View>
      </Card>

      <View className="gap-3">
        <Button title="Compartilhar recibo" icon="share-social-outline" onPress={handleShare} />
        {current.status === 'concluida' && (
          <Button title="Cancelar / estornar venda" icon="arrow-undo-outline" variant="danger" onPress={handleCancel} />
        )}
      </View>
    </ScrollView>
  );
}

import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSales } from '../src/hooks/useSales';
import { FilterBar } from '../src/components/FilterBar';
import { EmptyState } from '../src/components/EmptyState';
import { Card } from '../src/components/Card';
import { Icon } from '../src/components/Icon';
import { formatCurrency, formatDateTime, PAYMENT_LABELS } from '../src/utils/format';
import { colors } from '../src/theme';
import { PeriodFilter } from '../src/types/sale';

const PERIODS: { key: PeriodFilter; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: '7 dias' },
  { key: 'month', label: '30 dias' },
  { key: 'all', label: 'Tudo' },
];

export default function Historico() {
  const router = useRouter();
  const { sales, loading, period, setPeriod, totalCompleted } = useSales('today');

  return (
    <View className="flex-1 p-4">
      <FilterBar options={PERIODS} value={period} onChange={setPeriod} />

      <View className="bg-slate-800 rounded-2xl p-4 mb-4 shadow-sm">
        <Text className="text-xs text-stone-300">Total do período (sem canceladas)</Text>
        <Text className="text-3xl font-bold text-amber-400 mt-1">{formatCurrency(totalCompleted)}</Text>
      </View>

      {loading && sales.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} className="mt-10" />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card
              className="p-4 mb-2.5 flex-row items-center"
              onPress={() => router.push(`/venda-detalhe?id=${item.id}`)}
            >
              <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                <Icon name="receipt-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-stone-900">Venda #{item.id}</Text>
                <Text className="text-xs text-stone-500">{formatDateTime(item.createdAt)}</Text>
                <Text className="text-xs text-stone-500">
                  {PAYMENT_LABELS[item.paymentMethod] ?? item.paymentMethod}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className={`text-lg font-bold ${
                    item.status === 'cancelada' ? 'text-stone-400 line-through' : 'text-amber-700'
                  }`}
                >
                  {formatCurrency(item.total)}
                </Text>
                {item.status === 'cancelada' && (
                  <View className="bg-red-100 px-2 py-0.5 rounded-full mt-1">
                    <Text className="text-xs font-bold text-red-700">Cancelada</Text>
                  </View>
                )}
              </View>
              <View className="ml-2">
                <Icon name="chevron-forward" size={18} color={colors.placeholder} />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState icon="receipt-outline" title="Nenhuma venda no período" />
          }
        />
      )}
    </View>
  );
}

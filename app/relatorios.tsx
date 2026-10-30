import { View, Text, ScrollView } from 'react-native';
import { useReports } from '../src/hooks/useReports';
import { FilterBar } from '../src/components/FilterBar';
import { StatCard } from '../src/components/StatCard';
import { BarChart } from '../src/components/BarChart';
import { EmptyState } from '../src/components/EmptyState';
import { formatCurrency } from '../src/utils/format';
import { Granularity } from '../src/utils/reportBuckets';

const OPTIONS: { key: Granularity; label: string }[] = [
  { key: 'day', label: 'Por dia' },
  { key: 'week', label: 'Por semana' },
  { key: 'month', label: 'Por mês' },
];

const WINDOW_LABEL: Record<Granularity, string> = {
  day: 'Últimos 7 dias',
  week: 'Últimas 4 semanas',
  month: 'Últimos 6 meses',
};

export default function Relatorios() {
  const { granularity, setGranularity, summary, buckets, topProducts } = useReports();

  return (
    <ScrollView contentContainerClassName="p-4 pb-10">
      <FilterBar options={OPTIONS} value={granularity} onChange={setGranularity} />

      <Text className="text-xs uppercase tracking-wider text-stone-500 mb-2">
        {WINDOW_LABEL[granularity]}
      </Text>
      <View className="flex-row gap-3 mb-3">
        <StatCard label="Faturamento" value={formatCurrency(summary.total)} />
        <StatCard label="Vendas" value={String(summary.count)} />
      </View>
      <View className="flex-row gap-3 mb-6">
        <StatCard label="Custo" value={formatCurrency(summary.cost)} />
        <StatCard
          label="Lucro"
          value={formatCurrency(summary.profit)}
          tone={summary.profit > 0 ? 'good' : 'default'}
        />
      </View>

      <Text className="text-xs uppercase tracking-wider text-stone-500 mb-2">
        Faturamento {granularity === 'day' ? 'por dia' : granularity === 'week' ? 'por semana' : 'por mês'}
      </Text>
      <View className="mb-6">
        <BarChart data={buckets} />
      </View>

      <Text className="text-xs uppercase tracking-wider text-stone-500 mb-2">
        Produtos mais vendidos
      </Text>
      {topProducts.length === 0 ? (
        <EmptyState icon="📊" title="Sem vendas no período" />
      ) : (
        topProducts.map((p, index) => (
          <View key={p.name} className="flex-row items-center bg-white rounded-xl p-3 mb-2">
            <Text className="text-xl font-bold text-amber-700 w-8">{index + 1}º</Text>
            <View className="flex-1">
              <Text className="font-bold text-stone-900" numberOfLines={1}>{p.name}</Text>
              <Text className="text-xs text-stone-500">{p.quantity} un. vendidas</Text>
            </View>
            <Text className="font-bold text-stone-900">{formatCurrency(p.revenue)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

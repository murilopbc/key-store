import { View, Text, ScrollView } from 'react-native';
import { useReports } from '../src/hooks/useReports';
import { FilterBar } from '../src/components/FilterBar';
import { StatCard } from '../src/components/StatCard';
import { BarChart } from '../src/components/BarChart';
import { EmptyState } from '../src/components/EmptyState';
import { Card } from '../src/components/Card';
import { SectionTitle } from '../src/components/SectionTitle';
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

      <SectionTitle title="Resumo" right={WINDOW_LABEL[granularity]} className="mb-3" />
      <View className="flex-row gap-3 mb-3">
        <StatCard label="Faturamento" value={formatCurrency(summary.total)} icon="trending-up-outline" />
        <StatCard label="Vendas" value={String(summary.count)} icon="receipt-outline" />
      </View>
      <View className="flex-row gap-3 mb-6">
        <StatCard label="Custo" value={formatCurrency(summary.cost)} icon="pricetag-outline" />
        <StatCard
          label="Lucro"
          value={formatCurrency(summary.profit)}
          tone={summary.profit > 0 ? 'good' : 'default'}
          icon="wallet-outline"
        />
      </View>

      <SectionTitle
        title={`Faturamento ${granularity === 'day' ? 'por dia' : granularity === 'week' ? 'por semana' : 'por mês'}`}
        className="mb-3"
      />
      <View className="mb-6">
        <BarChart data={buckets} />
      </View>

      <SectionTitle title="Produtos mais vendidos" className="mb-3" />
      {topProducts.length === 0 ? (
        <EmptyState icon="bar-chart-outline" title="Sem vendas no período" />
      ) : (
        topProducts.map((p, index) => (
          <Card key={p.name} className="flex-row items-center p-3 mb-2.5">
            <View
              className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                index === 0 ? 'bg-amber-600' : 'bg-amber-100'
              }`}
            >
              <Text className={`font-bold ${index === 0 ? 'text-white' : 'text-amber-800'}`}>
                {index + 1}º
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-stone-900" numberOfLines={1}>{p.name}</Text>
              <Text className="text-xs text-stone-500">{p.quantity} un. vendidas</Text>
            </View>
            <Text className="font-bold text-stone-900">{formatCurrency(p.revenue)}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

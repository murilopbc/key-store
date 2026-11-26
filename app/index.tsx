import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useDashboard } from '../src/hooks/useDashboard';
import { useProductLookup } from '../src/hooks/useProductLookup';
import { StatCard } from '../src/components/StatCard';
import { Card } from '../src/components/Card';
import { SectionTitle } from '../src/components/SectionTitle';
import { Icon, IconName } from '../src/components/Icon';
import { BarcodeScanner } from '../src/components/BarcodeScanner';
import { formatCurrency } from '../src/utils/format';
import { colors } from '../src/theme';

interface ShortcutProps {
  icon: IconName;
  label: string;
  hint: string;
  onPress: () => void;
}

function Shortcut({ icon, label, hint, onPress }: ShortcutProps) {
  return (
    <View className="w-[48%] mb-3">
      <Card className="p-4" onPress={onPress}>
        <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center mb-3">
          <Icon name={icon} size={22} color={colors.primary} />
        </View>
        <Text className="font-bold text-stone-900">{label}</Text>
        <Text className="text-xs text-stone-500 mt-0.5">{hint}</Text>
      </Card>
    </View>
  );
}

function HeaderButton({ icon, onPress, badge, label }: { icon: IconName; onPress: () => void; badge?: number; label: string }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel={label} hitSlop={8}>
      <Icon name={icon} size={24} color={colors.headerText} />
      {badge ? (
        <View className="absolute -top-1.5 -right-2 bg-red-600 rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center">
          <Text className="text-white text-[10px] font-bold">{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { today, lowStock, unread } = useDashboard();
  const { findByBarcode } = useProductLookup();
  const [showScanner, setShowScanner] = useState(false);

  async function handleScan(code: string) {
    setShowScanner(false);
    const product = await findByBarcode(code);
    if (product) {
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
    return <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center gap-5 mr-1">
              <HeaderButton
                icon="notifications-outline"
                label="Notificações"
                badge={unread}
                onPress={() => router.push('/notificacoes')}
              />
              <HeaderButton
                icon="person-circle-outline"
                label="Perfil"
                onPress={() => router.push('/profile')}
              />
            </View>
          ),
        }}
      />

      <ScrollView contentContainerClassName="p-4 pb-10">
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1 flex-row items-center bg-amber-700 rounded-2xl p-4 shadow-sm"
            onPress={() => router.push('/venda')}
            accessibilityRole="button"
          >
            <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center mr-3">
              <Icon name="cart" size={26} color={colors.white} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Nova venda</Text>
              <Text className="text-amber-100 text-xs">Abrir o caixa</Text>
            </View>
            <Icon name="chevron-forward" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-20 bg-slate-800 rounded-2xl items-center justify-center shadow-sm"
            onPress={() => setShowScanner(true)}
            accessibilityLabel="Escanear código de barras"
          >
            <Icon name="barcode-outline" size={28} color={colors.white} />
            <Text className="text-white text-[11px] font-semibold mt-1">Escanear</Text>
          </TouchableOpacity>
        </View>

        <SectionTitle title="Resumo de hoje" className="mb-3" />
        <View className="flex-row gap-3 mb-3">
          <StatCard label="Vendido" value={formatCurrency(today.total)} tone="good" icon="cash-outline" />
          <StatCard label="Vendas" value={String(today.count)} icon="receipt-outline" />
        </View>
        <View className="mb-6">
          <StatCard
            label="Estoque baixo"
            value={lowStock === 0 ? 'Tudo em dia' : `${lowStock} ${lowStock === 1 ? 'item' : 'itens'}`}
            tone={lowStock > 0 ? 'warning' : 'default'}
            icon="alert-circle-outline"
            onPress={() => router.push('/estoque?filter=low')}
          />
        </View>

        <SectionTitle title="Atalhos" className="mb-3" />
        <View className="flex-row flex-wrap justify-between">
          <Shortcut icon="add-circle-outline" label="Cadastrar" hint="Novo produto" onPress={() => router.push('/produto-form')} />
          <Shortcut icon="cube-outline" label="Estoque" hint="Produtos e quantidades" onPress={() => router.push('/estoque')} />
          <Shortcut icon="time-outline" label="Histórico" hint="Vendas realizadas" onPress={() => router.push('/historico')} />
          <Shortcut icon="bar-chart-outline" label="Relatórios" hint="Faturamento e lucro" onPress={() => router.push('/relatorios')} />
        </View>
      </ScrollView>
    </>
  );
}

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthContext } from '../src/contexts/AuthContext';
import { useDashboard } from '../src/hooks/useDashboard';
import { useProductLookup } from '../src/hooks/useProductLookup';
import { StatCard } from '../src/components/StatCard';
import { BarcodeScanner } from '../src/components/BarcodeScanner';
import { formatCurrency } from '../src/utils/format';

interface ShortcutProps {
  icon: string;
  label: string;
  onPress: () => void;
  highlight?: boolean;
}

function Shortcut({ icon, label, onPress, highlight }: ShortcutProps) {
  return (
    <TouchableOpacity
      className={`w-[48%] rounded-xl p-4 mb-3 ${highlight ? 'bg-amber-700' : 'bg-white'}`}
      onPress={onPress}
    >
      <Text className="text-3xl mb-2">{icon}</Text>
      <Text className={`font-bold ${highlight ? 'text-white' : 'text-stone-800'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthContext();
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
          title: '🔑 Loja de Chaves',
          headerRight: () => (
            <View className="flex-row items-center gap-5">
              <TouchableOpacity onPress={() => router.push('/notificacoes')}>
                <Text className="text-2xl">🔔</Text>
                {unread > 0 && (
                  <View className="absolute -top-1 -right-2 bg-red-600 rounded-full min-w-[18px] px-1 items-center">
                    <Text className="text-white text-[10px] font-bold">{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/profile')}>
                <Text className="text-2xl">👤</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerClassName="p-4">
        <Text className="text-stone-500 mb-4" numberOfLines={1}>
          Olá, {user?.email}
        </Text>

        <Text className="text-xs uppercase tracking-wider text-stone-500 mb-2">
          Resumo de hoje
        </Text>
        <View className="flex-row gap-3 mb-3">
          <StatCard label="Vendido" value={formatCurrency(today.total)} tone="good" />
          <StatCard label="Vendas" value={String(today.count)} />
        </View>
        <View className="flex-row gap-3 mb-6">
          <StatCard
            label="Estoque baixo"
            value={`${lowStock} ${lowStock === 1 ? 'item' : 'itens'}`}
            tone={lowStock > 0 ? 'warning' : 'default'}
            onPress={() => router.push('/estoque?filter=low')}
          />
        </View>

        <Text className="text-xs uppercase tracking-wider text-stone-500 mb-2">
          Atalhos
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <Shortcut highlight icon="🛒" label="Nova venda" onPress={() => router.push('/venda')} />
          <Shortcut icon="📷" label="Escanear" onPress={() => setShowScanner(true)} />
          <Shortcut icon="➕" label="Cadastrar produto" onPress={() => router.push('/produto-form')} />
          <Shortcut icon="📦" label="Estoque" onPress={() => router.push('/estoque')} />
          <Shortcut icon="🧾" label="Histórico" onPress={() => router.push('/historico')} />
          <Shortcut icon="📊" label="Relatórios" onPress={() => router.push('/relatorios')} />
        </View>
      </ScrollView>
    </>
  );
}

import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNotifications } from '../src/hooks/useNotifications';
import { EmptyState } from '../src/components/EmptyState';
import { formatDateTime } from '../src/utils/format';
import { NotificationType } from '../src/types/notification';
import type { PermissionResult } from '../src/services/notificationService';

const ICONS: Record<NotificationType, string> = {
  stock: '📦',
  order: '🛠️',
  goal: '🎯',
  info: 'ℹ️',
};

function notificationAlert(result: PermissionResult) {
  if (result === 'granted') return ['Alertas ativados', 'Você receberá avisos de estoque baixo.'] as const;
  if (result === 'denied') return ['Permissão negada', 'Ative nos ajustes do aparelho.'] as const;
  return ['Indisponível neste ambiente', 'O Expo Go não inclui notificações neste SDK. Os alertas continuam aparecendo na lista do app. Para notificações do sistema, use um development build.'] as const;
}

export default function Notificacoes() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, enablePush } =
    useNotifications();

  async function handleEnable() {
    const [title, message] = notificationAlert(await enablePush());
    Alert.alert(title, message);
  }

  function handleClear() {
    Alert.alert('Limpar notificações', 'Apagar todas as notificações?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: clearAll },
    ]);
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row gap-2 mb-3">
        <TouchableOpacity className="flex-1 bg-white border border-stone-300 rounded-lg p-3" onPress={handleEnable}>
          <Text className="text-center text-stone-800 font-medium">🔔 Ativar alertas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-white border border-stone-300 rounded-lg p-3"
          disabled={unreadCount === 0}
          onPress={markAllAsRead}
        >
          <Text className={`text-center font-medium ${unreadCount === 0 ? 'text-stone-300' : 'text-stone-800'}`}>
            ✓ Marcar lidas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white border border-red-200 rounded-lg p-3"
          disabled={notifications.length === 0}
          onPress={handleClear}
        >
          <Text className="text-red-600">🗑</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`flex-row rounded-xl p-4 mb-2 ${item.read === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-white'}`}
            onPress={() => item.read === 0 && markAsRead(item.id)}
          >
            <Text className="text-2xl mr-3">{ICONS[item.type]}</Text>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-stone-900 flex-1">{item.title}</Text>
                {item.read === 0 && <View className="w-2 h-2 rounded-full bg-amber-600" />}
              </View>
              <Text className="text-stone-700">{item.message}</Text>
              <Text className="text-xs text-stone-400 mt-1">{formatDateTime(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="Nenhum alerta"
            subtitle="Avisaremos quando o estoque de algum item ficar baixo."
          />
        }
      />
    </View>
  );
}

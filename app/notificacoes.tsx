import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNotifications } from '../src/hooks/useNotifications';
import { EmptyState } from '../src/components/EmptyState';
import { IconButton } from '../src/components/IconButton';
import { Card } from '../src/components/Card';
import { Icon, IconName } from '../src/components/Icon';
import { formatDateTime } from '../src/utils/format';
import { colors } from '../src/theme';
import { NotificationType } from '../src/types/notification';
import type { PermissionResult } from '../src/services/notificationService';

const ICONS: Record<NotificationType, { name: IconName; color: string; bg: string }> = {
  stock: { name: 'cube-outline', color: '#b91c1c', bg: 'bg-red-100' },
  order: { name: 'construct-outline', color: '#1d4ed8', bg: 'bg-blue-100' },
  goal: { name: 'trophy-outline', color: '#047857', bg: 'bg-emerald-100' },
  info: { name: 'information-circle-outline', color: '#57534e', bg: 'bg-stone-100' },
};

function notificationAlert(result: PermissionResult) {
  if (result === 'granted') return ['Alertas ativados', 'Você receberá avisos de estoque baixo.'] as const;
  if (result === 'denied') return ['Permissão negada', 'Ative nos ajustes do aparelho.'] as const;
  return ['Indisponível neste ambiente', 'O Expo Go não inclui notificações neste SDK. Os alertas continuam aparecendo na lista do app. Para notificações do sistema, use um development build.'] as const;
}

function ActionButton({ icon, label, onPress, disabled }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-center gap-1.5 bg-white border border-stone-300 rounded-xl h-12 ${disabled ? 'opacity-40' : ''}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon name={icon} size={18} color={colors.text} />
      <Text className="text-stone-800 font-semibold">{label}</Text>
    </TouchableOpacity>
  );
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
      <View className="flex-row gap-2 mb-4">
        <ActionButton icon="notifications-outline" label="Ativar alertas" onPress={handleEnable} />
        <ActionButton
          icon="checkmark-done-outline"
          label="Marcar lidas"
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
        />
        <IconButton
          icon="trash-outline"
          variant="danger"
          accessibilityLabel="Apagar todas"
          onPress={handleClear}
          disabled={notifications.length === 0}
        />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const icon = ICONS[item.type] ?? ICONS.info;
          const unread = item.read === 0;
          return (
            <Card
              className="flex-row p-4 mb-2.5"
              tone={unread ? 'highlight' : 'default'}
              onPress={() => unread && markAsRead(item.id)}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${icon.bg}`}>
                <Icon name={icon.name} size={20} color={icon.color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-stone-900 flex-1">{item.title}</Text>
                  {unread && <View className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
                </View>
                <Text className="text-stone-700">{item.message}</Text>
                <Text className="text-xs text-stone-400 mt-1">{formatDateTime(item.createdAt)}</Text>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="Nenhum alerta"
            subtitle="Avisaremos quando o estoque de algum item ficar baixo."
          />
        }
      />
    </View>
  );
}

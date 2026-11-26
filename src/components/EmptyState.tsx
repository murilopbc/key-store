import { View, Text } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '../theme';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'key-outline', title, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-14 px-6">
      <View className="w-20 h-20 rounded-full bg-amber-100 items-center justify-center mb-4">
        <Icon name={icon} size={36} color={colors.primary} />
      </View>
      <Text className="text-lg font-bold text-stone-800 text-center">{title}</Text>
      {subtitle ? (
        <Text className="text-sm text-stone-500 mt-1 text-center">{subtitle}</Text>
      ) : null}
    </View>
  );
}

import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = '🔑', title, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16 px-6">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-stone-700 text-center">{title}</Text>
      {subtitle ? (
        <Text className="text-sm text-stone-400 mt-1 text-center">{subtitle}</Text>
      ) : null}
    </View>
  );
}

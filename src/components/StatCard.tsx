import { View, Text, TouchableOpacity } from 'react-native';

interface StatCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'warning' | 'good';
  onPress?: () => void;
}

const TONES = {
  default: 'bg-white',
  warning: 'bg-red-50 border border-red-200',
  good: 'bg-emerald-50 border border-emerald-200',
};

export function StatCard({ label, value, tone = 'default', onPress }: StatCardProps) {
  const content = (
    <View className={`flex-1 p-4 rounded-xl ${TONES[tone]}`}>
      <Text className="text-xs uppercase tracking-wider text-stone-500">{label}</Text>
      <Text className="text-2xl font-bold text-stone-900 mt-1">{value}</Text>
    </View>
  );
  if (!onPress) return <View className="flex-1">{content}</View>;
  return (
    <TouchableOpacity className="flex-1" onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

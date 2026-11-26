import { View, Text } from 'react-native';
import { Card } from './Card';
import { Icon, IconName } from './Icon';

interface StatCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'warning' | 'good';
  icon?: IconName;
  onPress?: () => void;
}

const TONES = {
  default: { chip: 'bg-stone-100', icon: '#57534e', value: 'text-stone-900' },
  warning: { chip: 'bg-red-100', icon: '#b91c1c', value: 'text-red-700' },
  good: { chip: 'bg-emerald-100', icon: '#047857', value: 'text-emerald-700' },
};

export function StatCard({ label, value, tone = 'default', icon, onPress }: StatCardProps) {
  const t = TONES[tone];
  return (
    <View className="flex-1">
      <Card className="p-4" onPress={onPress}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-stone-500">{label}</Text>
          {icon ? (
            <View className={`w-8 h-8 rounded-full items-center justify-center ${t.chip}`}>
              <Icon name={icon} size={16} color={t.icon} />
            </View>
          ) : null}
        </View>
        <Text className={`text-2xl font-bold mt-1 ${t.value}`} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {onPress ? <Text className="text-xs text-amber-700 font-semibold mt-1">Ver detalhes</Text> : null}
      </Card>
    </View>
  );
}

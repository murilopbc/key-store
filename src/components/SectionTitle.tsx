import { View, Text } from 'react-native';

interface SectionTitleProps {
  title: string;
  right?: string;
  className?: string;
}

export function SectionTitle({ title, right, className = 'mt-2 mb-3' }: SectionTitleProps) {
  return (
    <View className={`flex-row items-end justify-between ${className}`}>
      <Text className="text-base font-bold text-stone-800">{title}</Text>
      {right ? <Text className="text-xs text-stone-500">{right}</Text> : null}
    </View>
  );
}

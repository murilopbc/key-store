import { ScrollView, TouchableOpacity, Text } from 'react-native';

export interface FilterOption<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface FilterBarProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function FilterBar<T extends string>({
  options,
  value,
  onChange,
}: FilterBarProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0 mb-3"
      contentContainerClassName="gap-2"
    >
      {options.map((option) => {
        const active = option.key === value;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`px-4 py-2 rounded-full border ${
              active ? 'bg-amber-700 border-amber-700' : 'bg-white border-stone-200'
            }`}
          >
            <Text className={`text-sm ${active ? 'text-white font-bold' : 'text-stone-700 font-medium'}`}>
              {option.label}
              {option.count !== undefined ? ` (${option.count})` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

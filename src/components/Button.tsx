import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

const STYLES = {
  primary: { box: 'bg-amber-700', text: 'text-white' },
  secondary: { box: 'bg-white border border-stone-300', text: 'text-stone-800' },
  danger: { box: 'bg-white border border-red-300', text: 'text-red-600' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const style = STYLES[variant];
  return (
    <TouchableOpacity
      className={`p-4 rounded-lg items-center justify-center ${style.box} ${
        disabled || loading ? 'opacity-50' : ''
      }`}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#b45309'} />
      ) : (
        <Text className={`font-bold ${style.text}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
}

const STYLES = {
  primary: { box: 'bg-amber-700 shadow-sm', text: 'text-white', icon: colors.white },
  secondary: { box: 'bg-white border border-stone-300', text: 'text-stone-800', icon: colors.text },
  danger: { box: 'bg-white border border-red-300', text: 'text-red-600', icon: colors.danger },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const style = STYLES[variant];
  return (
    <TouchableOpacity
      className={`min-h-[52px] px-4 rounded-xl items-center justify-center ${style.box} ${
        disabled || loading ? 'opacity-50' : ''
      }`}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon ? <Icon name={icon} size={20} color={style.icon} /> : null}
          <Text className={`font-bold text-base ${style.text}`}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

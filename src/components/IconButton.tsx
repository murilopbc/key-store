import { TouchableOpacity } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors } from '../theme';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  variant?: 'dark' | 'light' | 'danger';
  accessibilityLabel: string;
  disabled?: boolean;
}

const STYLES = {
  dark: { box: 'bg-slate-800', color: colors.white },
  light: { box: 'bg-white border border-stone-300', color: colors.text },
  danger: { box: 'bg-white border border-red-200', color: colors.danger },
};

/** Botão quadrado só com ícone (escanear, apagar...). Altura igual à dos campos. */
export function IconButton({ icon, onPress, variant = 'dark', accessibilityLabel, disabled }: IconButtonProps) {
  const style = STYLES[variant];
  return (
    <TouchableOpacity
      className={`w-12 h-12 rounded-xl items-center justify-center ${style.box} ${disabled ? 'opacity-40' : ''}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name={icon} color={style.color} />
    </TouchableOpacity>
  );
}

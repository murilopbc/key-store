import type { ReactNode } from 'react';
import { View, TouchableOpacity } from 'react-native';

type CardTone = 'default' | 'highlight' | 'danger';

interface CardProps {
  children: ReactNode;
  /** Só layout/espaçamento (p-4, mb-2, flex-row...). Cor de fundo e borda vêm de `tone`. */
  className?: string;
  tone?: CardTone;
  onPress?: () => void;
}

// Cores definidas por variante: no NativeWind duas classes de cor concorrentes
// (ex.: bg-white + bg-amber-50) não têm ordem garantida.
const TONES: Record<CardTone, string> = {
  default: 'bg-white border-stone-200',
  highlight: 'bg-amber-50 border-amber-300',
  danger: 'bg-white border-red-200',
};

/** Superfície padrão: borda + sombra leve para separar do fundo. */
export function Card({ children, className = '', tone = 'default', onPress }: CardProps) {
  const classes = `rounded-2xl border shadow-sm ${TONES[tone]} ${className}`;
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} className={classes} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View className={classes}>{children}</View>;
}

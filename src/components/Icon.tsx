import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Ícones vetoriais (Ionicons): iguais no Android e no iPhone, ao contrário dos emojis. */
export function Icon({ name, size = 22, color = colors.text }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

import { View, Text, Image } from 'react-native';
import { Product } from '../types/product';
import { formatCurrency } from '../utils/format';
import { Card } from './Card';
import { Icon, IconName } from './Icon';
import { colors } from '../theme';

interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void;
  /** Ação à direita (ex.: "Adicionar" na venda). Sem ela, mostra uma seta. */
  actionLabel?: string;
  actionIcon?: IconName;
}

export function ProductItem({ product, onPress, actionLabel, actionIcon = 'add-circle' }: ProductItemProps) {
  const low = product.quantity <= product.minStock;
  const out = product.quantity === 0;
  const badge = out
    ? { box: 'bg-red-100', text: 'text-red-700', label: 'Sem estoque' }
    : low
      ? { box: 'bg-amber-100', text: 'text-amber-800', label: `${product.quantity} un. · baixo` }
      : { box: 'bg-emerald-100', text: 'text-emerald-700', label: `${product.quantity} un.` };

  return (
    <Card className="flex-row items-center p-3 mb-2.5" onPress={() => onPress(product)}>
      {product.photoUri ? (
        <Image source={{ uri: product.photoUri }} className="w-14 h-14 rounded-xl mr-3" />
      ) : (
        <View className="w-14 h-14 rounded-xl mr-3 bg-amber-100 items-center justify-center">
          <Icon name="key-outline" size={26} color={colors.primary} />
        </View>
      )}

      <View className="flex-1 pr-2">
        <Text className="font-bold text-stone-900 text-base" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-xs text-stone-500" numberOfLines={1}>
          {[product.category, product.model].filter(Boolean).join(' · ') || 'Sem categoria'}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <Text className="text-amber-700 font-bold">{formatCurrency(product.salePrice)}</Text>
          <View className={`px-2 py-0.5 rounded-full ${badge.box}`}>
            <Text className={`text-[11px] font-bold ${badge.text}`}>{badge.label}</Text>
          </View>
        </View>
      </View>

      {actionLabel ? (
        <View className="items-center">
          <Icon name={actionIcon} size={30} color={colors.primary} />
          <Text className="text-[11px] text-amber-700 font-bold mt-0.5">{actionLabel}</Text>
        </View>
      ) : (
        <Icon name="chevron-forward" size={20} color={colors.placeholder} />
      )}
    </Card>
  );
}

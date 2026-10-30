import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product } from '../types/product';
import { formatCurrency } from '../utils/format';

interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void;
  actionLabel?: string;
}

export function ProductItem({ product, onPress, actionLabel }: ProductItemProps) {
  const low = product.quantity <= product.minStock;
  const out = product.quantity === 0;

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white p-3 rounded-xl mb-2"
      onPress={() => onPress(product)}
    >
      {product.photoUri ? (
        <Image
          source={{ uri: product.photoUri }}
          className="w-14 h-14 rounded-lg mr-3"
        />
      ) : (
        <View className="w-14 h-14 rounded-lg mr-3 bg-amber-50 items-center justify-center">
          <Text className="text-2xl">🔑</Text>
        </View>
      )}

      <View className="flex-1">
        <Text className="font-bold text-stone-900" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-xs text-stone-500" numberOfLines={1}>
          {[product.category, product.model].filter(Boolean).join(' · ') || '—'}
        </Text>
        <Text className="text-amber-700 font-semibold mt-0.5">
          {formatCurrency(product.salePrice)}
        </Text>
      </View>

      <View className="items-end">
        <View
          className={`px-2 py-1 rounded-full ${
            out ? 'bg-red-100' : low ? 'bg-amber-100' : 'bg-emerald-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              out ? 'text-red-700' : low ? 'text-amber-800' : 'text-emerald-700'
            }`}
          >
            {out ? 'Sem estoque' : `${product.quantity} un.`}
          </Text>
        </View>
        {actionLabel ? (
          <Text className="text-xs text-amber-700 font-bold mt-2">{actionLabel}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

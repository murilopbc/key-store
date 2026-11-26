import { View, Text } from 'react-native';
import { Bucket } from '../utils/reportBuckets';
import { Card } from './Card';

const MAX_HEIGHT = 120;

function short(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace('.', ',')}k`;
  return String(Math.round(value));
}

export function BarChart({ data }: { data: Bucket[] }) {
  const max = Math.max(...data.map((b) => b.total), 1);

  return (
    <Card className="flex-row items-end justify-between p-4">
      {data.map((bucket, index) => (
        <View key={`${bucket.label}-${index}`} className="items-center flex-1">
          <Text className="text-[10px] font-semibold text-stone-600 mb-1">
            {bucket.total > 0 ? short(bucket.total) : ''}
          </Text>
          <View
            className={`w-6 rounded-t-md ${bucket.total > 0 ? 'bg-amber-600' : 'bg-stone-200'}`}
            style={{ height: Math.max(3, (bucket.total / max) * MAX_HEIGHT) }}
          />
          <Text className="text-[10px] text-stone-500 mt-1.5">{bucket.label}</Text>
        </View>
      ))}
    </Card>
  );
}

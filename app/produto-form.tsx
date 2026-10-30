import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProduct } from '../src/hooks/useProduct';
import { FormField } from '../src/components/FormField';
import { Button } from '../src/components/Button';
import { CameraCapture } from '../src/components/CameraCapture';
import { BarcodeScanner } from '../src/components/BarcodeScanner';
import { savePhotoPermanently, deletePhoto } from '../src/services/fileService';
import { parseMoney, parseInteger, moneyToInput } from '../src/utils/format';
import { colors } from '../src/theme';

interface FormState {
  name: string;
  category: string;
  model: string;
  barcode: string;
  costPrice: string;
  salePrice: string;
  quantity: string;
  minStock: string;
  photoUri: string | null;
}

const EMPTY: FormState = {
  name: '',
  category: '',
  model: '',
  barcode: '',
  costPrice: '',
  salePrice: '',
  quantity: '0',
  minStock: '5',
  photoUri: null,
};

const SUGGESTED_CATEGORIES = [
  'Chave simples',
  'Chave tetra',
  'Chave codificada',
  'Chave canivete',
  'Telecomando',
  'Cadeado',
];

type Errors = Partial<Record<keyof FormState, string>>;

export default function ProdutoForm() {
  const router = useRouter();
  // /produto-form → criar | /produto-form?id=5 → editar
  const { id, barcode: barcodeParam } = useLocalSearchParams<{ id?: string; barcode?: string }>();
  const productId = id ? Number(id) : undefined;
  const isEditing = productId !== undefined;

  const { product, loading, save } = useProduct(productId);
  const [form, setForm] = useState<FormState>({ ...EMPTY, barcode: barcodeParam ?? '' });
  const [errors, setErrors] = useState<Errors>({});
  const [mode, setMode] = useState<'form' | 'camera' | 'scanner'>('form');
  const [saving, setSaving] = useState(false);
  const populated = useRef(false);

  useEffect(() => {
    if (product && !populated.current) {
      populated.current = true;
      setForm({
        name: product.name,
        category: product.category,
        model: product.model,
        barcode: product.barcode ?? '',
        costPrice: moneyToInput(product.costPrice),
        salePrice: moneyToInput(product.salePrice),
        quantity: String(product.quantity),
        minStock: String(product.minStock),
        photoUri: product.photoUri,
      });
    }
  }, [product]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCapture(tempUri: string) {
    // Foto tirada e ainda não salva no banco: descarta a anterior, se houver.
    if (form.photoUri && form.photoUri !== product?.photoUri) deletePhoto(form.photoUri);
    update('photoUri', savePhotoPermanently(tempUri, 'produto'));
    setMode('form');
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Informe o nome do produto.';
    if (parseMoney(form.salePrice) <= 0) next.salePrice = 'Informe o preço de venda.';
    if (form.costPrice.trim() && parseMoney(form.costPrice) < 0) next.costPrice = 'Valor inválido.';
    if (parseInteger(form.quantity) < 0) next.quantity = 'Valor inválido.';
    if (parseInteger(form.minStock) < 0) next.minStock = 'Valor inválido.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    try {
      setSaving(true);
      await save({
        name: form.name.trim(),
        category: form.category.trim(),
        model: form.model.trim(),
        barcode: form.barcode.trim() || null,
        costPrice: parseMoney(form.costPrice),
        salePrice: parseMoney(form.salePrice),
        quantity: parseInteger(form.quantity),
        minStock: parseInteger(form.minStock),
        photoUri: form.photoUri,
      });
      router.back();
    } catch (error) {
      const duplicate = String(error).includes('UNIQUE');
      Alert.alert(
        'Erro',
        duplicate
          ? 'Já existe um produto com este código de barras.'
          : 'Não foi possível salvar o produto.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (mode === 'camera') {
    return <CameraCapture facing="back" onCapture={handleCapture} onClose={() => setMode('form')} />;
  }
  if (mode === 'scanner') {
    return (
      <BarcodeScanner
        onScan={(code) => {
          update('barcode', code);
          setMode('form');
        }}
        onClose={() => setMode('form')}
      />
    );
  }

  if (isEditing && loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="p-4 pb-10" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-stone-900 mb-4">
          {isEditing ? 'Editar produto' : 'Novo produto'}
        </Text>

        <TouchableOpacity className="items-center mb-5" onPress={() => setMode('camera')}>
          {form.photoUri ? (
            <Image source={{ uri: form.photoUri }} className="w-40 h-40 rounded-2xl" />
          ) : (
            <View className="w-40 h-40 rounded-2xl bg-stone-200 items-center justify-center">
              <Text className="text-5xl">📷</Text>
            </View>
          )}
          <Text className="text-amber-700 font-bold mt-2">
            {form.photoUri ? 'Trocar foto' : 'Fotografar produto'}
          </Text>
        </TouchableOpacity>

        <FormField
          label="Nome *"
          value={form.name}
          error={errors.name}
          onChangeText={(v) => update('name', v)}
        />

        <FormField
          label="Categoria"
          value={form.category}
          onChangeText={(v) => update('category', v)}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0 -mt-2 mb-4" contentContainerClassName="gap-2">
          {SUGGESTED_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              className="px-3 py-1 rounded-full bg-stone-200"
              onPress={() => update('category', c)}
            >
              <Text className="text-xs text-stone-700">{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FormField
          label="Modelo"
          value={form.model}
          onChangeText={(v) => update('model', v)}
        />

        <View className="flex-row items-end gap-2">
          <View className="flex-1">
            <FormField
              label="Código de barras"
              keyboardType="number-pad"
              value={form.barcode}
              onChangeText={(v) => update('barcode', v)}
            />
          </View>
          <TouchableOpacity
            className="bg-slate-800 rounded-lg px-4 h-12 mb-4 items-center justify-center"
            onPress={() => setMode('scanner')}
          >
            <Text className="text-xl">📷</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Preço de custo"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={form.costPrice}
              error={errors.costPrice}
              onChangeText={(v) => update('costPrice', v)}
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Preço de venda *"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={form.salePrice}
              error={errors.salePrice}
              onChangeText={(v) => update('salePrice', v)}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Quantidade"
              keyboardType="number-pad"
              value={form.quantity}
              error={errors.quantity}
              onChangeText={(v) => update('quantity', v)}
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Estoque mínimo"
              keyboardType="number-pad"
              value={form.minStock}
              error={errors.minStock}
              onChangeText={(v) => update('minStock', v)}
            />
          </View>
        </View>

        <Button title={isEditing ? 'Salvar alterações' : 'Cadastrar produto'} onPress={handleSave} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

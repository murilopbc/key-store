import { useRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  title?: string;
}

export function BarcodeScanner({
  onScan,
  onClose,
  title = 'Aponte para o código de barras',
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false); // a câmera dispara várias leituras seguidas

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Verificando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-8">
        <Text className="text-6xl mb-4">📷</Text>
        <Text className="text-white text-center mb-6">
          Precisamos da câmera para ler códigos de barras e QR Codes.
        </Text>
        <TouchableOpacity
          className="bg-amber-700 px-6 py-3 rounded-lg"
          onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
        >
          <Text className="text-white font-bold">
            {permission.canAskAgain ? 'Conceder permissão' : 'Abrir ajustes do aparelho'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-6" onPress={onClose}>
          <Text className="text-stone-300">Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleScanned({ data }: { data: string }) {
    if (handled.current) return;
    handled.current = true;
    onScan(data);
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
        onBarcodeScanned={handleScanned}
      />

      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
      >
        <View className="w-72 h-40 border-4 border-amber-500 rounded-2xl" />
        <Text className="text-white mt-6 font-medium">{title}</Text>
      </View>

      <View className="items-center py-6 bg-black">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-white text-lg">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

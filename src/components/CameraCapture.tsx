import { useRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Icon } from './Icon';
import { colors } from '../theme';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
  facing?: 'front' | 'back';
}

export function CameraCapture({ onCapture, onClose, facing = 'back' }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Estado 1 — ainda consultando o sistema
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Verificando permissões...</Text>
      </View>
    );
  }

  // Estado 2 — negada
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-8">
        <View className="mb-4">
          <Icon name="camera-outline" size={64} color={colors.white} />
        </View>
        <Text className="text-white text-center mb-6">
          Precisamos da câmera para fotografar o item.
        </Text>
        {permission.canAskAgain ? (
          <TouchableOpacity
            className="bg-amber-700 px-6 py-3 rounded-lg"
            onPress={requestPermission}
          >
            <Text className="text-white font-bold">Conceder permissão</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-amber-700 px-6 py-3 rounded-lg"
            onPress={() => Linking.openSettings()}
          >
            <Text className="text-white font-bold">Abrir ajustes do aparelho</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity className="mt-6" onPress={onClose}>
          <Text className="text-stone-300">Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Estado 3 — liberada
  async function takePicture() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) onCapture(photo.uri);
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

      <View className="flex-row justify-around items-center py-6 bg-black">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-white text-lg">Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-20 h-20 rounded-full bg-white border-4 border-stone-400"
          onPress={takePicture}
        />

        <View className="w-16" />
      </View>
    </View>
  );
}

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuthContext } from '../src/contexts/AuthContext';
import { useSecurityContext } from '../src/contexts/SecurityContext';
import { useProfile } from '../src/hooks/useProfile';
import { useDemoData } from '../src/hooks/useDemoData';
import { FormField } from '../src/components/FormField';
import { Button } from '../src/components/Button';
import { CameraCapture } from '../src/components/CameraCapture';
import { useCnpjLookup } from '../src/hooks/useCnpjLookup';
import { formatCnpj, onlyDigits } from '../src/utils/cnpj';
import { formatPhone } from '../src/utils/format';
import { savePhotoPermanently, deletePhoto } from '../src/services/fileService';
import {
  requestNotificationPermission,
  type PermissionResult,
} from '../src/services/notificationService';

function notificationAlert(result: PermissionResult) {
  if (result === 'granted') return ['Alertas ativados', 'Você receberá avisos de estoque baixo.'] as const;
  if (result === 'denied') return ['Permissão negada', 'Ative nos ajustes do aparelho.'] as const;
  return ['Indisponível neste ambiente', 'O Expo Go não inclui notificações neste SDK. Os alertas continuam aparecendo na lista do app. Para notificações do sistema, use um development build.'] as const;
}

export default function Profile() {
  const { user, signOut, resetPassword } = useAuthContext();
  const { biometricEnabled, enableBiometric, disableBiometric, lock } = useSecurityContext();
  const { profile, save } = useProfile();
  const { loadDemoProducts } = useDemoData();
  const cnpjLookup = useCnpjLookup();

  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [legalName, setLegalName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const populated = useRef(false);

  useEffect(() => {
    if (profile && !populated.current) {
      populated.current = true;
      setName(profile.name);
      setStoreName(profile.storeName);
      setPhotoUri(profile.photoUri);
      setCnpj(formatCnpj(profile.cnpj ?? ''));
      setLegalName(profile.legalName ?? '');
      setAddress(profile.address ?? '');
      setPhone(formatPhone(profile.phone ?? ''));
    }
  }, [profile]);

  function handleCnpjChange(text: string) {
    setCnpj(formatCnpj(text));
    cnpjLookup.clearError();
  }

  async function handleLookupCnpj() {
    const company = await cnpjLookup.lookup(cnpj);
    if (!company) return; // o erro aparece embaixo do campo
    setStoreName(company.tradeName || company.legalName);
    setLegalName(company.legalName);
    setAddress(company.address);
    if (company.phone) setPhone(formatPhone(company.phone));

    const inactive = company.status && company.status !== 'ATIVA';
    Alert.alert(
      inactive ? 'Atenção: CNPJ não está ativo' : 'Dados encontrados',
      inactive
        ? `Situação na Receita: ${company.status}. Os dados foram preenchidos mesmo assim; confira antes de salvar.`
        : 'Confira os campos preenchidos e toque em "Salvar perfil".',
    );
  }

  function handleCapture(tempUri: string) {
    // foto ainda não salva no banco: descarta a anterior não persistida
    if (photoUri && photoUri !== profile?.photoUri) deletePhoto(photoUri);
    setPhotoUri(savePhotoPermanently(tempUri, 'perfil'));
    setShowCamera(false);
  }

  async function handleSave() {
    try {
      setSaving(true);
      await save({
        name: name.trim(),
        email: user?.email ?? '',
        storeName: storeName.trim(),
        photoUri,
        cnpj: onlyDigits(cnpj),
        legalName: legalName.trim(),
        address: address.trim(),
        phone: onlyDigits(phone),
      });
      Alert.alert('Pronto', 'Perfil salvo.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleBiometric(value: boolean) {
    if (value) {
      const result = await enableBiometric();
      if (!result.ok && result.message) Alert.alert('Biometria', result.message);
    } else {
      await disableBiometric();
    }
  }

  async function handleChangePassword() {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      Alert.alert('Email enviado', `Enviamos um link para ${user.email} para você escolher uma nova senha.`);
    } catch (error) {
      Alert.alert('Erro', (error as Error).message);
    }
  }

  async function handleNotifications() {
    const [title, message] = notificationAlert(await requestNotificationPermission());
    Alert.alert(title, message);
  }

  async function handleDemo() {
    const inserted = await loadDemoProducts();
    Alert.alert(
      inserted > 0 ? 'Produtos criados' : 'Nada a fazer',
      inserted > 0
        ? `${inserted} produtos de exemplo foram cadastrados.`
        : 'O catálogo já tem produtos.',
    );
  }

  function handleSignOut() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          lock();
        },
      },
    ]);
  }

  if (showCamera) {
    return <CameraCapture facing="front" onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <ScrollView contentContainerClassName="p-6 pb-12" keyboardShouldPersistTaps="handled">
      <TouchableOpacity className="items-center mb-6" onPress={() => setShowCamera(true)}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} className="w-32 h-32 rounded-full" />
        ) : (
          <View className="w-32 h-32 rounded-full bg-stone-200 items-center justify-center">
            <Text className="text-5xl">👤</Text>
          </View>
        )}
        <Text className="text-amber-700 font-bold mt-2">
          {photoUri ? 'Trocar foto' : 'Tirar foto'}
        </Text>
      </TouchableOpacity>

      <Text className="text-xs uppercase tracking-wider text-stone-500 mb-2">Dados do vendedor</Text>
      <FormField label="Nome" value={name} onChangeText={setName} />
      <FormField label="Email (conta)" value={user?.email ?? ''} editable={false} />

      <Text className="text-xs uppercase tracking-wider text-stone-500 mt-4 mb-2">Dados da loja</Text>
      <FormField
        label="CNPJ"
        value={cnpj}
        onChangeText={handleCnpjChange}
        keyboardType="number-pad"
        placeholder="00.000.000/0000-00"
        maxLength={18}
        error={cnpjLookup.error ?? undefined}
      />
      <View className="mb-4">
        <Button
          title="Buscar dados pelo CNPJ (BrasilAPI)"
          variant="secondary"
          onPress={handleLookupCnpj}
          loading={cnpjLookup.loading}
        />
      </View>
      <FormField label="Nome da loja" value={storeName} onChangeText={setStoreName} />
      <FormField label="Razão social" value={legalName} onChangeText={setLegalName} />
      <FormField label="Endereço" value={address} onChangeText={setAddress} multiline />
      <FormField
        label="Telefone"
        value={phone}
        onChangeText={(t) => setPhone(formatPhone(t))}
        keyboardType="phone-pad"
        placeholder="(00) 00000-0000"
        maxLength={15}
      />
      <Button title="Salvar perfil" onPress={handleSave} loading={saving} />

      <Text className="text-xs uppercase tracking-wider text-stone-500 mt-8 mb-2">Segurança</Text>
      <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-bold text-stone-900">Desbloqueio por biometria</Text>
          <Text className="text-xs text-stone-500">
            Digital ou Face ID ao abrir o app. A senha continua como alternativa.
          </Text>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={toggleBiometric}
          trackColor={{ true: '#b45309' }}
        />
      </View>
      <Button title="Trocar senha (enviar link por email)" variant="secondary" onPress={handleChangePassword} />

      <Text className="text-xs uppercase tracking-wider text-stone-500 mt-8 mb-2">Aplicativo</Text>
      <View className="gap-3">
        <Button title="Ativar alertas de estoque" variant="secondary" onPress={handleNotifications} />
        <Button title="Carregar produtos de exemplo" variant="secondary" onPress={handleDemo} />
        <Button title="Sair da conta" variant="danger" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}

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
import { Card } from '../src/components/Card';
import { SectionTitle } from '../src/components/SectionTitle';
import { Icon } from '../src/components/Icon';
import { colors } from '../src/theme';
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
    <ScrollView contentContainerClassName="p-4 pb-12" keyboardShouldPersistTaps="handled">
      <TouchableOpacity className="items-center mb-6 mt-2" onPress={() => setShowCamera(true)}>
        <View>
          {photoUri ? (
            <Image source={{ uri: photoUri }} className="w-28 h-28 rounded-full" />
          ) : (
            <View className="w-28 h-28 rounded-full bg-amber-100 items-center justify-center">
              <Icon name="person" size={52} color={colors.primary} />
            </View>
          )}
          <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-amber-700 border-2 border-white items-center justify-center">
            <Icon name="camera" size={16} color={colors.white} />
          </View>
        </View>
        <Text className="text-amber-700 font-bold mt-2">
          {photoUri ? 'Trocar foto' : 'Tirar foto'}
        </Text>
      </TouchableOpacity>

      <SectionTitle title="Dados do vendedor" />
      <Card className="p-4 pb-0 mb-6">
        <FormField label="Nome" value={name} onChangeText={setName} />
        <FormField label="Email (conta)" value={user?.email ?? ''} editable={false} />
      </Card>

      <SectionTitle title="Dados da loja" />
      <Card className="p-4 mb-4">
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
          title="Buscar dados pelo CNPJ"
          icon="search-outline"
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
      <Text className="text-xs text-stone-400 -mt-2">Dados públicos consultados na BrasilAPI.</Text>
      </Card>
      <Button title="Salvar perfil" icon="checkmark-circle-outline" onPress={handleSave} loading={saving} />

      <SectionTitle title="Segurança" className="mt-8 mb-3" />
      <Card className="p-4 mb-3 flex-row items-center justify-between">
        <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
          <Icon name="finger-print" size={20} color={colors.primary} />
        </View>
        <View className="flex-1 pr-4">
          <Text className="font-bold text-stone-900">Desbloqueio por biometria</Text>
          <Text className="text-xs text-stone-500">
            Digital ou Face ID ao abrir o app. A senha continua como alternativa.
          </Text>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={toggleBiometric}
          trackColor={{ true: colors.primary }}
        />
      </Card>
      <Button title="Trocar senha por email" icon="key-outline" variant="secondary" onPress={handleChangePassword} />

      <SectionTitle title="Aplicativo" className="mt-8 mb-3" />
      <View className="gap-3">
        <Button title="Ativar alertas de estoque" icon="notifications-outline" variant="secondary" onPress={handleNotifications} />
        <Button title="Carregar produtos de exemplo" icon="download-outline" variant="secondary" onPress={handleDemo} />
        <Button title="Sair da conta" icon="log-out-outline" variant="danger" onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}

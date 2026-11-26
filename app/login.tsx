import { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../src/contexts/AuthContext';
import { useSecurityContext } from '../src/contexts/SecurityContext';
import { FormField } from '../src/components/FormField';
import { Button } from '../src/components/Button';
import { Icon } from '../src/components/Icon';
import { colors } from '../src/theme';

export default function Login() {
  const router = useRouter();
  const { signIn, resetPassword } = useAuthContext();
  const { unlock, lock } = useSecurityContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Atenção', 'Informe o email e uma senha de ao menos 6 caracteres.');
      return;
    }
    try {
      setLoading(true);
      unlock(); // login com senha já é prova suficiente: não pede biometria em seguida
      await signIn(email.trim(), password);
      // Não navegamos aqui! O _layout redireciona sozinho.
    } catch (error) {
      lock();
      Alert.alert('Erro', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu email no campo acima primeiro.');
      return;
    }
    try {
      await resetPassword(email.trim());
      Alert.alert('Email enviado', 'Confira sua caixa de entrada para redefinir a senha.');
    } catch (error) {
      Alert.alert('Erro', (error as Error).message);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-800"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="self-center w-20 h-20 rounded-3xl bg-amber-700 items-center justify-center mb-4 shadow-lg">
          <Icon name="key" size={40} color={colors.white} />
        </View>
        <Text className="text-3xl font-bold text-white text-center">
          Loja de Chaves
        </Text>
        <Text className="text-stone-400 text-center mb-8">Acesso do vendedor</Text>

        <View className="bg-white rounded-3xl p-5 shadow-lg">
          <FormField
            label="Email"
            placeholder="vendedor@loja.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormField
            label="Senha"
            placeholder="••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Entrar" onPress={handleLogin} loading={loading} />

          <TouchableOpacity className="mt-4 p-1" onPress={handleForgot}>
            <Text className="text-amber-700 text-center font-semibold">Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-6 p-2" onPress={() => router.push('/register')}>
          <Text className="text-stone-300 text-center">
            Ainda não tem conta? <Text className="text-amber-500 font-bold">Criar conta</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
        <Text className="text-6xl text-center mb-2">🔑</Text>
        <Text className="text-3xl font-bold text-amber-500 text-center">
          Loja de Chaves
        </Text>
        <Text className="text-stone-400 text-center mb-8">Acesso do vendedor</Text>

        <View className="bg-stone-50 rounded-2xl p-5">
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

          <TouchableOpacity className="mt-4" onPress={handleForgot}>
            <Text className="text-stone-500 text-center">Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-6" onPress={() => router.push('/register')}>
          <Text className="text-amber-500 text-center font-bold">Criar uma conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

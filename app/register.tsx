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

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuthContext();
  const { unlock, lock } = useSecurityContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Atenção', 'Informe o email e uma senha de ao menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Atenção', 'As senhas não conferem.');
      return;
    }
    try {
      setLoading(true);
      unlock();
      await signUp(email.trim(), password);
      // O _layout redireciona para a home assim que o usuário existir.
    } catch (error) {
      lock();
      Alert.alert('Erro', (error as Error).message);
    } finally {
      setLoading(false);
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
          <Icon name="person-add" size={36} color={colors.white} />
        </View>
        <Text className="text-3xl font-bold text-white text-center mb-1">
          Criar conta
        </Text>
        <Text className="text-stone-400 text-center mb-8">
          Cadastro do vendedor
        </Text>

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
            label="Senha (mín. 6 caracteres)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <FormField
            label="Confirmar senha"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
          <Button title="Cadastrar" onPress={handleRegister} loading={loading} />
        </View>

        <TouchableOpacity className="mt-6 p-2" onPress={() => router.back()}>
          <Text className="text-stone-300 text-center">
            Já tem conta? <Text className="text-amber-500 font-bold">Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

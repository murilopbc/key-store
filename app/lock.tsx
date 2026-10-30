import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthContext } from '../src/contexts/AuthContext';
import { useSecurityContext } from '../src/contexts/SecurityContext';
import { Button } from '../src/components/Button';

/** Tela de bloqueio: a sessão do Firebase existe, mas falta provar que é o dono. */
export default function Lock() {
  const { user, signOut } = useAuthContext();
  const { authenticate, lock } = useSecurityContext();
  const [failed, setFailed] = useState(false);

  const tryUnlock = useCallback(async () => {
    const ok = await authenticate(); // sucesso → _layout redireciona para a home
    setFailed(!ok);
  }, [authenticate]);

  useEffect(() => {
    tryUnlock();
  }, [tryUnlock]);

  // Fallback obrigatório: sair e entrar com a senha.
  async function usePassword() {
    await signOut();
    lock();
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-800 p-8">
      <Text className="text-6xl mb-4">🔒</Text>
      <Text className="text-2xl font-bold text-amber-500 mb-1">App bloqueado</Text>
      <Text className="text-stone-400 mb-10 text-center">{user?.email}</Text>

      {failed && (
        <Text className="text-red-400 mb-4 text-center">
          Não foi possível confirmar sua identidade.
        </Text>
      )}

      <View className="w-full gap-3">
        <Button title="Desbloquear com biometria" onPress={tryUnlock} />
        <TouchableOpacity className="p-3" onPress={usePassword}>
          <Text className="text-stone-300 text-center">Entrar com senha</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

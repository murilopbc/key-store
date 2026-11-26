import '../global.css'; // ⚠️ precisa ser a PRIMEIRA importação
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuthContext } from '../src/contexts/AuthContext';
import {
  SecurityProvider,
  useSecurityContext,
} from '../src/contexts/SecurityContext';
import { initNotifications } from '../src/services/notificationService';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SecurityProvider>
        <RootLayoutNav />
      </SecurityProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuthContext();
  const { ready, biometricEnabled, unlocked } = useSecurityContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initNotifications(); // seguro: não faz nada se o módulo nativo não existir
  }, []);

  useEffect(() => {
    if (loading || !ready) return;

    const first = segments[0];
    const inAuthGroup = first === 'login' || first === 'register';
    const onLock = first === 'lock';

    // 1) Sem sessão: só entra em login/cadastro.
    if (!user) {
      if (!inAuthGroup) router.replace('/login');
      return;
    }
    // 2) Sessão restaurada + biometria ativa: precisa desbloquear.
    if (biometricEnabled && !unlocked) {
      if (!onLock) router.replace('/lock');
      return;
    }
    // 3) Tudo certo: quem está logado não volta para login/lock.
    if (inAuthGroup || onLock) router.replace('/');
  }, [user, loading, ready, biometricEnabled, unlocked, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.headerText,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen
          name="lock"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="index" options={{ title: 'Loja de Chaves' }} />
        <Stack.Screen name="estoque" options={{ title: 'Estoque' }} />
        <Stack.Screen name="produto" options={{ title: 'Produto' }} />
        <Stack.Screen name="produto-form" options={{ title: 'Produto' }} />
        <Stack.Screen name="venda" options={{ title: 'Nova venda' }} />
        <Stack.Screen name="historico" options={{ title: 'Histórico de vendas' }} />
        <Stack.Screen name="venda-detalhe" options={{ title: 'Detalhe da venda' }} />
        <Stack.Screen name="relatorios" options={{ title: 'Relatórios' }} />
        <Stack.Screen name="notificacoes" options={{ title: 'Notificações' }} />
        <Stack.Screen name="profile" options={{ title: 'Perfil e configurações' }} />
      </Stack>

      {/* Evita o "flash" da tela errada enquanto o Firebase/SQLite respondem */}
      {(loading || !ready) && (
        <View className="absolute inset-0 items-center justify-center bg-stone-50">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </>
  );
}

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import * as ProfileRepository from '../database/profileRepository';
import {
  getBiometricStatus,
  authenticateWithBiometrics,
} from '../services/biometric';

const RELOCK_AFTER_MS = 30_000; // volta a travar após 30s em segundo plano

interface SecurityContextType {
  ready: boolean;
  biometricEnabled: boolean;
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
  authenticate: () => Promise<boolean>;
  enableBiometric: () => Promise<{ ok: boolean; message?: string }>;
  disableBiometric: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

/**
 * A biometria só DESBLOQUEIA uma sessão que já foi autenticada no Firebase.
 * Não substitui o login: o fallback é sempre a senha.
 */
export function SecurityProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const backgroundedAt = useRef<number | null>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    ProfileRepository.getProfile()
      .then((profile) => {
        const enabled = profile?.biometricEnabled === 1;
        enabledRef.current = enabled;
        setBiometricEnabledState(enabled);
      })
      .catch((e) => console.error('Erro ao ler perfil:', e))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active' && backgroundedAt.current !== null) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (enabledRef.current && away > RELOCK_AFTER_MS) setUnlocked(false);
      }
    });
    return () => sub.remove();
  }, []);

  const unlock = useCallback(() => setUnlocked(true), []);
  const lock = useCallback(() => setUnlocked(false), []);

  const authenticate = useCallback(async () => {
    const ok = await authenticateWithBiometrics();
    if (ok) setUnlocked(true);
    return ok;
  }, []);

  const enableBiometric = useCallback(async () => {
    const status = await getBiometricStatus();
    if (status === 'no_hardware') {
      return { ok: false, message: 'Este aparelho não possui sensor biométrico.' };
    }
    if (status === 'not_enrolled') {
      return {
        ok: false,
        message: 'Cadastre uma digital ou rosto nos ajustes do aparelho primeiro.',
      };
    }
    // Confirma que o dono do aparelho é quem está ativando.
    const confirmed = await authenticateWithBiometrics('Confirme para ativar a biometria');
    if (!confirmed) return { ok: false, message: 'Autenticação cancelada.' };

    await ProfileRepository.setBiometricEnabled(true);
    enabledRef.current = true;
    setBiometricEnabledState(true);
    return { ok: true };
  }, []);

  const disableBiometric = useCallback(async () => {
    await ProfileRepository.setBiometricEnabled(false);
    enabledRef.current = false;
    setBiometricEnabledState(false);
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        ready,
        biometricEnabled,
        unlocked,
        unlock,
        lock,
        authenticate,
        enableBiometric,
        disableBiometric,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurityContext(): SecurityContextType {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext deve ser usado dentro de um <SecurityProvider>');
  }
  return context;
}

import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricStatus } from '../types/auth';

export async function getBiometricStatus(): Promise<BiometricStatus> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return 'no_hardware';
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) return 'not_enrolled';
  return 'ready';
}

export async function authenticateWithBiometrics(
  promptMessage = 'Desbloquear o app',
): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar senha do aparelho',
  });
  return result.success;
}

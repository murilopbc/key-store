import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

type NotificationsModule = typeof import('expo-notifications');
export type PermissionResult = 'granted' | 'denied' | 'unavailable';

let cached: NotificationsModule | null | undefined;

// No Expo Go o módulo nativo de notificações não existe: nem tentamos carregar,
// porque o simples require já registra um erro no console.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Carrega o expo-notifications só quando preciso e dentro de try/catch.
 * Em alguns ambientes (ex.: Expo Go sem o módulo nativo) o import lança erro
 * e derrubaria o app inteiro. Aqui o app apenas segue sem notificações.
 */
function getNotifications(): NotificationsModule | null {
  if (cached !== undefined) return cached;
  if (isExpoGo) {
    cached = null;
    return cached;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as NotificationsModule;
  } catch {
    console.warn('expo-notifications indisponível neste ambiente.');
    cached = null;
  }
  return cached;
}

export function isNotificationsAvailable(): boolean {
  return getNotifications() !== null;
}

/** Define como a notificação aparece com o app aberto. Chamar uma vez no layout. */
export function initNotifications(): void {
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Não foi possível configurar notificações:', error);
  }
}

export async function requestNotificationPermission(): Promise<PermissionResult> {
  const Notifications = getNotifications();
  if (!Notifications) return 'unavailable';
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Alertas da loja',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/** Dispara uma notificação local imediata (se disponível e permitida). */
export async function sendLocalNotification(title: string, body: string): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return;
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch (error) {
    console.warn('Falha ao enviar notificação local:', error);
  }
}

/**
 * Token para push REMOTO. Exige development build com projectId do EAS.
 * Falha silenciosa (null) em qualquer outro ambiente.
 */
export async function registerForPushToken(): Promise<string | null> {
  const Notifications = getNotifications();
  if (!Notifications) return null;
  try {
    if ((await requestNotificationPermission()) !== 'granted') return null;
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return null;
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return null;
  }
}

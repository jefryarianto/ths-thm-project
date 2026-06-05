// FCM Notification Service
// Uses @react-native-firebase/messaging for native FCM token management.
// Falls back gracefully if FCM is unavailable (e.g. emulator without Play Services).

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@ths-thm/fcmToken';

/**
 * Request notification permissions and get the FCM device token.
 * Returns null if permissions are denied or FCM is unavailable.
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    const token = await messaging().getToken();
    if (token) {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      console.log('[FCM] Token obtained:', token.substring(0, 16) + '...');
      return token;
    }
  } catch (error: any) {
    console.log('[FCM] Token retrieval failed:', error?.message || error);
  }
  return null;
}

/**
 * Register the current device's FCM token with the THS-THM backend.
 * Call after successful login.
 */
export async function registerDeviceToken(): Promise<void> {
  try {
    const token = await getFcmToken();
    if (token) {
      const { authApi } = await import('./api');
      await authApi.registerFcmToken(token);
      console.log('[FCM] Token registered with backend');
    }
  } catch (error: any) {
    console.log('[FCM] Token registration skipped:', error?.message || error);
  }
}

/**
 * Unregister the device's FCM token from the THS-THM backend.
 * Call on logout.
 */
export async function unregisterDeviceToken(): Promise<void> {
  try {
    const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (storedToken) {
      const { authApi } = await import('./api');
      await authApi.unregisterFcmToken(storedToken);
      console.log('[FCM] Token unregistered from backend');
    }
  } catch (error: any) {
    console.log('[FCM] Token unregistration skipped:', error?.message || error);
  } finally {
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
  }
}

/**
 * Listen for FCM token refresh and re-register with backend.
 * Call once at app startup.
 */
export function onTokenRefresh(): Promise<() => void> {
  return Promise.resolve(
    messaging().onTokenRefresh(async (newToken: string) => {
      console.log('[FCM] Token refreshed');
      await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
      try {
        const { authApi } = await import('./api');
        await authApi.registerFcmToken(newToken);
        console.log('[FCM] Refreshed token registered');
      } catch {
        // Will retry on next launch
      }
    }),
  );
}

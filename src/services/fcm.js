import { getToken } from 'firebase/messaging';
import { messaging } from './firebase.js';

/* Requests notification permission and returns an FCM token, or throws
   with a reason code the caller can turn into a user-facing message:
   'unsupported' | 'denied' | anything else from the SDK/service worker. */
export async function requestFcmToken() {
  if (!messaging || !('Notification' in window) || !('serviceWorker' in navigator)) {
    throw new Error('unsupported');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('denied');
  }

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

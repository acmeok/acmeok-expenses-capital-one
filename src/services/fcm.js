import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase.js';

let listening = false;

/* Firebase only routes push messages through the service worker
   (onBackgroundMessage, see firebase-messaging-sw.js) when the app isn't
   the focused tab. With the app open and focused, messages arrive here
   instead via onMessage — without this, nothing shows up at all while
   testing with the tab open, which looks exactly like "no notification
   arrived" even though delivery actually worked. */
export function listenForForegroundMessages() {
  if (!messaging || listening) return;
  listening = true;

  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || 'Acme Expenses';
    const body = payload.notification?.body || '';

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          data: payload.data || {},
        });
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192.png' });
    }
  });
}

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

  /* register() can resolve while the worker is still installing, not yet
     active. Passing that registration to getToken() fails on the very
     first permission grant (it works after a reload only because the
     worker is already active by then). Waiting for .ready guarantees an
     active worker on the first attempt too. */
  await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const registration = await navigator.serviceWorker.ready;

  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

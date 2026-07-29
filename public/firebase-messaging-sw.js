importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');

/* Config values here are the same public client config already embedded
   in the main app bundle — not secret. A service worker file in public/
   isn't processed by Vite, so these can't come from import.meta.env and
   have to be hardcoded, same as any other firebase-messaging-sw.js. */
firebase.initializeApp({
  apiKey: 'AIzaSyBRB8OhCL80e0o0hglwtoQdYwPsGSaoCLc',
  authDomain: 'acmeok-dashboard.firebaseapp.com',
  projectId: 'acmeok-dashboard',
  messagingSenderId: '557242620616',
  appId: '1:557242620616:web:faab078bf27d0c2d3123fd',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Acme Expenses';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const txnId = event.notification.data?.transactionId;
  const url = txnId ? `/#/assign?txn=${encodeURIComponent(txnId)}` : '/#/home';
  event.waitUntil(clients.openWindow(url));
});

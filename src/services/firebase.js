import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const ALLOWED_EMAIL_DOMAIN = 'acmeok.com';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
// UX hint only, not the real enforcement — n8n verifies the domain (and the
// 4-cardholder whitelist) server-side on every request regardless.
googleProvider.setCustomParameters({ hd: ALLOWED_EMAIL_DOMAIN });

// Messaging isn't supported in every browser/context (e.g. no push API,
// or not served over HTTPS) — guard so an unsupported environment doesn't
// crash the whole app on load.
export let messaging = null;
try {
  messaging = getMessaging(firebaseApp);
} catch (err) {
  messaging = null;
}

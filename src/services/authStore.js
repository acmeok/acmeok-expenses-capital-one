import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';
import { verifyLogin, saveFcmToken } from './n8n.js';
import { requestFcmToken, listenForForegroundMessages } from './fcm.js';

/* Matches the dashboard app's proven AuthContext pattern exactly:
   signInWithPopup, then onAuthStateChanged drives verification against
   n8n, signing back out on any verification failure. Confirmed working in
   production for the dashboard (same Firebase project, same google
   account chooser popup) once its domain was added to Firebase's
   Authorized domains list — this app's domain needs that same step. */

let state = { status: 'loading', profile: null, error: null, fcmStatus: 'idle' };
const listeners = new Set();

function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

function friendlyPopupError(err) {
  if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
    return null; // user just backed out, not a real error
  }
  if (err.code === 'auth/popup-blocked') {
    return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.';
  }
  return 'Sign-in failed. Please try again.';
}

export async function signIn() {
  setState({ status: 'authenticating', profile: null, error: null });
  try {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged below takes over from here.
  } catch (err) {
    setState({ status: 'signedOut', profile: null, error: friendlyPopupError(err) });
  }
}

export function signOutUser() {
  return signOut(auth);
}

export async function getToken() {
  if (!auth.currentUser) throw new Error('Not signed in');
  return auth.currentUser.getIdToken();
}

const FCM_TOKEN_CACHE_KEY = 'expense_app_last_saved_fcm_token';

async function registerForPushNotifications(profile) {
  setState({ fcmStatus: 'registering' });
  try {
    const fcmToken = await requestFcmToken();
    listenForForegroundMessages();

    // Only hit our backend when the token actually changed — per BRIEF,
    // every app load should check the token, not blindly resave it.
    if (localStorage.getItem(FCM_TOKEN_CACHE_KEY) === fcmToken) {
      setState({ fcmStatus: 'granted' });
      return;
    }

    const idToken = await auth.currentUser.getIdToken();
    await saveFcmToken(idToken, { name: profile.name, fcmToken });
    // The save already succeeded on the server at this point, so a
    // failure writing the local cache (e.g. storage blocked/full) is not
    // worth reporting as a setup error.
    try {
      localStorage.setItem(FCM_TOKEN_CACHE_KEY, fcmToken);
    } catch (err) {
      // ignore, this is just an optimization to skip resaving unchanged tokens
    }
    setState({ fcmStatus: 'granted' });
  } catch (err) {
    console.error('Push notification setup failed:', err);
    const known = ['denied', 'unsupported'].includes(err.message);
    setState({ fcmStatus: known ? err.message : 'error' });
  }
}

let pendingError = null;

onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    setState({ status: 'signedOut', profile: null, error: pendingError });
    pendingError = null;
    return;
  }

  setState({ status: 'authenticating', profile: null, error: null });

  try {
    const idToken = await firebaseUser.getIdToken();
    const result = await verifyLogin(idToken);
    setState({ status: 'authenticated', profile: result, error: null });
    registerForPushNotifications(result);
  } catch (err) {
    pendingError =
      err.status === 403 || err.status === 401
        ? 'This Google account is not authorized to use this app.'
        : 'Could not verify your login. Please try again.';
    await signOut(auth);
    // onAuthStateChanged fires again with a null user, picking up pendingError above.
  }
});

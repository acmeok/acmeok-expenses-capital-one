import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';
import { verifyLogin } from './n8n.js';

/* Mirrors the pattern already used in the dashboard app's AuthContext:
   sign in with popup, then let onAuthStateChanged drive verification
   against the backend, signing back out on any verification failure. */

let state = { status: 'loading', profile: null, error: null };
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
  try {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged below takes over from here.
  } catch (err) {
    const message = friendlyPopupError(err);
    setState({ status: 'signedOut', profile: null, error: message });
  }
}

export function signOutUser() {
  return signOut(auth);
}

export async function getToken() {
  if (!auth.currentUser) throw new Error('Not signed in');
  return auth.currentUser.getIdToken();
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
  } catch (err) {
    pendingError =
      err.status === 403 || err.status === 401
        ? 'This Google account is not authorized to use this app.'
        : 'Could not verify your login. Please try again.';
    await signOut(auth);
    // onAuthStateChanged fires again with a null user, picking up pendingError above.
  }
});

import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';
import { verifyLogin } from './n8n.js';

/* Uses signInWithRedirect, not signInWithPopup. The voice app went through
   popup -> redirect -> back to popup -> this exact combo before landing
   here (see commit "Fix sign-in: use redirect with correct error handling
   for mobile"): plain popup flakes on desktop (Vercel's default
   Cross-Origin-Opener-Policy headers break the popup-to-opener handshake
   Firebase relies on) and fails outright on mobile/installed PWAs where
   popups are unreliable. getRedirectResult picks up the result (and any
   error) after the browser navigates back from Google. onAuthStateChanged
   then drives verification against the backend, signing back out on any
   verification failure, same as the dashboard app's AuthContext. */

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

export function signIn() {
  setState({ status: 'authenticating', profile: null, error: null });
  return signInWithRedirect(auth, googleProvider);
}

export function signOutUser() {
  return signOut(auth);
}

export async function getToken() {
  if (!auth.currentUser) throw new Error('Not signed in');
  return auth.currentUser.getIdToken();
}

let pendingError = null;

getRedirectResult(auth).catch((err) => {
  // 'auth/no-auth-event' just means the page loaded normally, with no
  // pending redirect to resolve — that's the common case, not an error.
  if (err.code && err.code !== 'auth/no-auth-event') {
    pendingError = 'Sign-in failed. Please try again.';
  }
});

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

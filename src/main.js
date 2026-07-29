import './styles/main.css';
import { registerRoute, setAuthChecker, refresh, startRouter } from './router.js';
import { subscribe, getState } from './services/authStore.js';
import { renderLogin } from './screens/login.js';
import { renderHome } from './screens/home.js';
import { renderAssignment } from './screens/assignment/index.js';
import { renderSuccess } from './screens/success.js';

registerRoute('/login', renderLogin);
registerRoute('/home', renderHome, { protected: true });
registerRoute('/assign', renderAssignment, { protected: true });
registerRoute('/success', renderSuccess, { protected: true });

setAuthChecker(() => {
  const state = getState();
  return { status: state.status, isAuthenticated: state.status === 'authenticated' };
});

startRouter(document.getElementById('app'));

subscribe(() => refresh());

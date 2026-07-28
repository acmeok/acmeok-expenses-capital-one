import './styles/main.css';
import { registerRoute, startRouter } from './router.js';
import { renderLogin } from './screens/login.js';
import { renderHome } from './screens/home.js';
import { renderAssignment } from './screens/assignment/index.js';
import { renderSuccess } from './screens/success.js';

registerRoute('/login', renderLogin);
registerRoute('/home', renderHome);
registerRoute('/assign', renderAssignment);
registerRoute('/success', renderSuccess);

startRouter(document.getElementById('app'));

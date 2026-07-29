const routes = new Map();
let authChecker = null; // () => { status, isAuthenticated }
let currentCleanup = null;
let refreshFn = null;

export function registerRoute(path, renderFn, options = {}) {
  routes.set(path, { renderFn, protected: !!options.protected });
}

export function setAuthChecker(fn) {
  authChecker = fn;
}

export function refresh() {
  if (refreshFn) refreshFn();
}

export function navigate(path) {
  window.location.hash = path;
}

function parseHash() {
  const hash = window.location.hash.slice(1) || '/login';
  const [path, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');
  return { path: path || '/login', params };
}

function renderLoading(container) {
  container.innerHTML = `
    <div style="flex:1; display:flex; align-items:center; justify-content:center;">
      <span class="text-secondary" style="font-size: var(--text-sm);">Loading…</span>
    </div>
  `;
}

export function startRouter(container) {
  async function render() {
    if (typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    const { path, params } = parseHash();
    const route = routes.get(path) || routes.get('/login');
    const auth = authChecker ? authChecker() : { status: 'authenticated', isAuthenticated: true };

    container.innerHTML = '';
    const screenEl = document.createElement('div');
    screenEl.className = 'screen screen-enter';
    container.appendChild(screenEl);

    if (route.protected) {
      if (auth.status === 'loading' || auth.status === 'authenticating') {
        renderLoading(screenEl);
        return;
      }
      if (!auth.isAuthenticated) {
        const next = encodeURIComponent(window.location.hash.slice(1) || path);
        navigate(`/login?next=${next}`);
        return;
      }
    } else if (path === '/login' && auth.isAuthenticated) {
      const next = params.get('next');
      navigate(next ? decodeURIComponent(next) : '/home');
      return;
    }

    currentCleanup = await route.renderFn(screenEl, params);
  }

  refreshFn = render;
  window.addEventListener('hashchange', render);
  render();
}

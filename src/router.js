const routes = new Map();

export function registerRoute(path, renderFn) {
  routes.set(path, renderFn);
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

export function startRouter(container) {
  async function render() {
    const { path, params } = parseHash();
    const renderFn = routes.get(path) || routes.get('/login');
    container.innerHTML = '';
    const screenEl = document.createElement('div');
    screenEl.className = 'screen screen-enter';
    container.appendChild(screenEl);
    await renderFn(screenEl, params);
  }
  window.addEventListener('hashchange', render);
  render();
}

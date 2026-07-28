import { googleLogoSvg } from '../components/googleIcon.js';
import { icon } from '../components/icon.js';
import { navigate } from '../router.js';

export function renderLogin(container) {
  container.classList.add('bg-texture');
  container.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column;">
      <div style="margin-top: 12vh; display:flex; flex-direction:column; align-items:center; text-align:center; gap: var(--space-sm);">
        <div style="
          width:88px; height:88px; border-radius:16px;
          background: var(--color-bg-surface);
          border: 2px solid var(--color-accent);
          display:flex; align-items:center; justify-content:center;
          margin-bottom: var(--space-md);
        ">
          <span style="font-family: var(--font-display); font-weight:700; font-size:32px; color: var(--color-accent); letter-spacing:0.02em;">AC</span>
        </div>
        <h1 style="font-size: var(--text-xl); color: var(--color-text-primary);">Acme Construction</h1>
        <p class="text-secondary" style="font-size: var(--text-sm);">Expense Tracking</p>
      </div>

      <div style="flex:1;"></div>

      <div id="login-error" class="glass-card" style="
        display:none; align-items:flex-start; gap: var(--space-sm);
        padding: var(--space-md); margin-bottom: var(--space-md);
        border-color: rgba(239,68,68,0.35);
        color: var(--color-danger);
      ">
        <span style="flex-shrink:0; margin-top:2px;">${icon('alertCircle', { size: 18 })}</span>
        <span style="font-size: var(--text-sm); color: var(--color-text-primary);" id="login-error-text"></span>
      </div>

      <div class="bottom-action">
        <button id="google-signin-btn" class="btn-primary" style="display:flex; align-items:center; justify-content:center; gap: var(--space-sm);">
          ${googleLogoSvg}
          <span>Sign in with Google</span>
        </button>
        <p class="text-secondary" style="font-size: var(--text-xs); text-align:center; margin-top:4px;">
          Restricted to @acmeok.com accounts
        </p>
      </div>
    </div>
  `;

  const btn = container.querySelector('#google-signin-btn');
  const errorBox = container.querySelector('#login-error');

  btn.addEventListener('click', () => {
    // Firebase Google Sign-In wiring happens in a later step.
    // Placeholder navigation so the flow is demonstrable during UI build-out.
    errorBox.style.display = 'none';
    navigate('/home');
  });
}

import { icon } from '../components/icon.js';
import { getState, signOutUser } from '../services/authStore.js';
import { MOCK_USER, MOCK_HISTORY } from '../utils/mockData.js';

function formatAmount(amount) {
  return `$${amount.toFixed(2)}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function historyItem(entry) {
  return `
    <div class="glass-card" style="padding: var(--space-md); display:flex; flex-direction:column; gap: var(--space-xs);">
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <span style="font-family: var(--font-display); font-weight:700; font-size: var(--text-lg); color: var(--color-text-primary);">${entry.merchant}</span>
        <span style="font-family: var(--font-display); font-weight:700; font-size: var(--text-lg); color: var(--color-accent);">${formatAmount(entry.amount)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="text-secondary" style="font-size: var(--text-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: var(--space-sm);">Job #${entry.jobId} · ${entry.jobDescription}</span>
        <span class="text-secondary" style="font-size: var(--text-xs); flex-shrink: 0;">${formatDate(entry.date)}</span>
      </div>
    </div>
  `;
}

export function renderHome(container) {
  const user = getState().profile || MOCK_USER;
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const listHtml = MOCK_HISTORY.length
    ? MOCK_HISTORY.map(historyItem).join('')
    : `
      <div class="glass-card" style="padding: var(--space-lg); text-align:center;">
        <p class="text-secondary" style="font-size: var(--text-sm);">
          No expenses submitted yet. You will be notified when a card transaction is detected.
        </p>
      </div>
    `;

  container.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; padding: var(--space-lg) 0 var(--space-md);">
      <h1 style="font-size: var(--text-xl);">Acme Expenses</h1>
      <button id="signout-btn" style="
        width:44px; height:44px; border-radius:50%;
        background: var(--color-bg-surface); border: 1px solid var(--color-border);
        color: var(--color-text-primary); font-family: var(--font-display); font-weight:700;
        display:flex; align-items:center; justify-content:center; cursor:pointer;
        font-size: var(--text-sm);
      " aria-label="Sign out">${initials}</button>
    </div>

    <p class="text-secondary" style="font-size: var(--text-sm); margin-bottom: var(--space-lg);">
      Signed in as: ${user.name}
    </p>

    <h2 style="font-size: var(--text-lg); margin-bottom: var(--space-md);">Recent Submissions</h2>

    <div style="display:flex; flex-direction:column; gap: var(--space-md); flex:1; overflow-y:auto; padding-bottom: var(--space-lg);">
      ${listHtml}
    </div>
  `;

  container.querySelector('#signout-btn').addEventListener('click', () => {
    signOutUser();
  });
}

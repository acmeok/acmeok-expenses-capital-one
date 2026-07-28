import { navigate } from '../router.js';
import { icon } from '../components/icon.js';
import { getLastSubmission } from '../utils/submissionStore.js';

function summaryRow(label, value) {
  return `
    <div style="display: flex; justify-content: space-between; gap: var(--space-md);">
      <span class="text-secondary" style="font-size: var(--text-sm); flex-shrink: 0;">${label}</span>
      <span style="font-size: var(--text-sm); font-weight: 600; text-align: right;">${value}</span>
    </div>
  `;
}

export function renderSuccess(container) {
  const submission = getLastSubmission();

  const summaryHtml = submission
    ? `
      <div class="glass-card" style="padding: var(--space-md); width: 100%; display: flex; flex-direction: column; gap: var(--space-sm); text-align: left;">
        ${summaryRow('Merchant', submission.merchant)}
        ${summaryRow('Amount', `$${submission.amount.toFixed(2)}`)}
        ${summaryRow('Job', `#${submission.jobId}`)}
      </div>
    `
    : '';

  container.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: var(--space-lg);">
      <div class="success-checkmark" style="
        width: 96px; height: 96px; border-radius: 50%;
        background: var(--color-accent); color: #000000;
        display: flex; align-items: center; justify-content: center;
      ">
        ${icon('check', { size: 48 })}
      </div>
      <h1 style="font-size: var(--text-3xl);">Purchase Assigned</h1>
      ${summaryHtml}
    </div>
    <div class="bottom-action">
      <button id="done-btn" class="btn-primary">Done</button>
    </div>
  `;

  container.querySelector('#done-btn').addEventListener('click', () => navigate('/home'));
}

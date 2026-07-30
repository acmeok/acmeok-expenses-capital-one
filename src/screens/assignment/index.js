import { renderJobStep } from './job.js';
import { renderDescriptionStep } from './description.js';
import { renderAudioStep } from './audio.js';
import { renderReviewStep } from './review.js';
import { getToken } from '../../services/authStore.js';
import { getTransaction } from '../../services/n8n.js';

const TOTAL_STEPS = 4;

const STEP_TITLES = {
  1: 'Select Job',
  2: 'Description',
  3: 'Audio Note',
  4: 'Review and Submit',
};

const STEP_RENDERERS = {
  1: renderJobStep,
  2: renderDescriptionStep,
  3: renderAudioStep,
  4: renderReviewStep,
};

function formatTransactionMeta(dateStr, cardholderName) {
  const formatted = new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${formatted} · ${cardholderName}`;
}

export function renderAssignment(container, params) {
  const transactionId = params.get('txn');

  const state = {
    transactionId,
    transaction: null,
    step: 1,
    jobId: null,
    jobDescription: null,
    description: '',
    audioBlob: null,
    audioUrl: null,
  };

  function goToStep(n) {
    state.step = n;
    draw();
  }

  function draw() {
    if (!state.transaction) {
      container.innerHTML = `
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <span class="text-secondary" style="font-size: var(--text-sm);">Loading transaction…</span>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="transaction-card" style="margin-top: var(--space-lg);">
        <div class="transaction-merchant">${state.transaction.merchant}</div>
        <div class="transaction-amount">$${state.transaction.amount.toFixed(2)}</div>
        <div class="transaction-meta">${formatTransactionMeta(state.transaction.date, state.transaction.cardholderName)}</div>
      </div>

      <div class="step-progress">
        ${Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)
          .map(
            (n) =>
              `<span class="step-dot ${n === state.step ? 'active' : n < state.step ? 'complete' : ''}"></span>`
          )
          .join('')}
      </div>

      <h2 class="screen-title" style="margin-bottom: var(--space-md);">${STEP_TITLES[state.step] || ''}</h2>

      <div id="assign-step-content" style="flex: 1; display: flex; flex-direction: column; min-height: 0;"></div>
    `;

    const stepContainer = container.querySelector('#assign-step-content');
    const renderer = STEP_RENDERERS[state.step];
    if (renderer) {
      renderer(stepContainer, state, { goToStep });
    }
  }

  function renderLoadError(message) {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); text-align: center; padding: var(--space-lg);">
        <span style="color: var(--color-danger); font-size: var(--text-sm);">${message}</span>
        <button id="retry-txn" class="btn-secondary" style="width: auto; padding: 0 var(--space-lg);">Try Again</button>
      </div>
    `;
    container.querySelector('#retry-txn').addEventListener('click', loadTransaction);
  }

  async function loadTransaction() {
    draw();
    if (!transactionId) {
      renderLoadError('No transaction was specified. Open this screen from a purchase notification.');
      return;
    }
    try {
      const idToken = await getToken();
      state.transaction = await getTransaction(idToken, transactionId);
      draw();
    } catch (err) {
      renderLoadError(err.message || 'Could not load this transaction. Please try again.');
    }
  }

  loadTransaction();
}

import { icon } from '../../components/icon.js';
import { navigate } from '../../router.js';
import { setLastSubmission } from '../../utils/submissionStore.js';

function summaryRow(label, value) {
  return `
    <div style="display: flex; justify-content: space-between; gap: var(--space-md);">
      <span class="text-secondary" style="font-size: var(--text-sm); flex-shrink: 0;">${label}</span>
      <span style="font-size: var(--text-sm); font-weight: 600; text-align: right;">${value}</span>
    </div>
  `;
}

export function renderReviewStep(container, state, { goToStep }) {
  container.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-md); overflow-y: auto;">
      <div class="glass-card" style="padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-xs);">
        <span class="text-secondary" style="font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.04em;">Job #${state.jobId}</span>
        <span style="font-size: var(--text-base); line-height: 1.4;">${state.jobDescription}</span>
      </div>

      <div class="glass-card" style="padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);">
        ${summaryRow('Description', state.description || '—')}
      </div>

      <div class="glass-card" style="padding: var(--space-md); display: flex; align-items: center; justify-content: space-between;">
        <span class="text-secondary" style="font-size: var(--text-sm);">Audio Note</span>
        <button id="review-playback" style="display: flex; align-items: center; justify-content: center; gap: var(--space-sm); min-height: 44px; background: var(--color-bg-surface); border: 1px solid var(--color-steel); border-radius: 10px; padding: 0 14px; color: var(--color-text-primary); cursor: pointer;">
          ${icon('play', { size: 14 })} <span style="font-size: var(--text-sm);">Play</span>
        </button>
      </div>
    </div>

    <div class="bottom-action">
      <button id="review-submit" class="btn-primary">Submit</button>
      <button id="review-back" class="btn-secondary">Back</button>
    </div>
  `;

  container.querySelector('#review-back').addEventListener('click', () => goToStep(3));

  const playbackBtn = container.querySelector('#review-playback');
  let audioEl = state.audioUrl ? new Audio(state.audioUrl) : null;
  let isPlaying = false;

  playbackBtn.addEventListener('click', () => {
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
      isPlaying = false;
    } else {
      audioEl.currentTime = 0;
      audioEl.play();
      isPlaying = true;
      audioEl.addEventListener('ended', () => {
        isPlaying = false;
        playbackBtn.querySelector('span').textContent = 'Play';
      });
    }
    playbackBtn.querySelector('span').textContent = isPlaying ? 'Playing' : 'Play';
  });

  const submitBtn = container.querySelector('#review-submit');
  submitBtn.addEventListener('click', () => {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    setLastSubmission({
      merchant: state.transaction.merchant,
      amount: state.transaction.amount,
      jobId: state.jobId,
      jobDescription: state.jobDescription,
      description: state.description,
    });

    // Real n8n /webhook/expense-submit call happens in a later step.
    setTimeout(() => navigate('/success'), 800);
  });
}

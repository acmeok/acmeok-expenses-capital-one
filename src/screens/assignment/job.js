import { icon } from '../../components/icon.js';
import { getToken } from '../../services/authStore.js';
import { getJobs } from '../../services/n8n.js';

export function renderJobStep(container, state, { goToStep }) {
  container.innerHTML = `
    <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <span class="text-secondary" style="font-size: var(--text-sm);">Loading your jobs…</span>
    </div>
  `;

  let allJobs = [];

  function renderError(message) {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); text-align: center; padding: var(--space-lg);">
        <span style="color: var(--color-danger); font-size: var(--text-sm);">${message}</span>
        <button id="retry-jobs" class="btn-secondary" style="width: auto; padding: 0 var(--space-lg);">Try Again</button>
      </div>
    `;
    container.querySelector('#retry-jobs').addEventListener('click', load);
  }

  function renderList() {
    container.innerHTML = `
      <div class="search-wrap" style="margin-bottom: var(--space-md);">
        <span class="search-icon">${icon('search', { size: 18 })}</span>
        <input type="text" id="job-search" class="search-input" placeholder="Search your jobs" autocomplete="off" />
      </div>
      <div class="list" id="job-list" style="overflow-y: auto;"></div>
    `;

    const listEl = container.querySelector('#job-list');
    const searchEl = container.querySelector('#job-search');

    function drawList(filter = '') {
      const f = filter.toLowerCase();
      const filtered = allJobs.filter(
        (j) =>
          j.id.toLowerCase().includes(f) ||
          j.description.toLowerCase().includes(f) ||
          (j.jobRef && j.jobRef.includes(f))
      );

      listEl.innerHTML = filtered.length
        ? filtered
            .map(
              (j) => `
        <div class="list-item" data-job-id="${j.id}" style="min-height: 72px; padding: 10px 16px;">
          <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
            <span class="text-secondary" style="font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.04em;">
              ${j.jobRef ? `Job #${j.jobRef} · ` : ''}Task #${j.id}
            </span>
            <span style="white-space: normal; line-height: 1.3;">${j.description}</span>
          </div>
          <span class="chevron">${icon('chevronRight', { size: 18 })}</span>
        </div>
      `
            )
            .join('')
        : `<div style="padding: var(--space-md); color: var(--color-text-secondary); font-size: var(--text-sm);">No active jobs match "${filter}"</div>`;

      listEl.querySelectorAll('.list-item').forEach((item) => {
        item.addEventListener('click', () => {
          const job = allJobs.find((j) => j.id === item.dataset.jobId);
          state.jobId = job.id;
          state.jobDescription = job.description;
          goToStep(2);
        });
      });
    }

    drawList();
    searchEl.addEventListener('input', (e) => drawList(e.target.value));
  }

  async function load() {
    container.innerHTML = `
      <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
        <span class="text-secondary" style="font-size: var(--text-sm);">Loading your jobs…</span>
      </div>
    `;
    try {
      const idToken = await getToken();
      const result = await getJobs(idToken);
      allJobs = result.jobs || [];
      if (allJobs.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="padding: var(--space-lg); text-align: center;">
            <p class="text-secondary" style="font-size: var(--text-sm);">You have no active jobs assigned right now.</p>
          </div>
        `;
        return;
      }
      renderList();
    } catch (err) {
      renderError(err.message || 'Could not load your jobs. Please try again.');
    }
  }

  load();
}

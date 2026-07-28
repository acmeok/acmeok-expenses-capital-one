import { icon } from '../../components/icon.js';
import { MOCK_JOBS } from '../../utils/mockData.js';

export function renderJobStep(container, state, { goToStep }) {
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
    const filtered = MOCK_JOBS.filter(
      (j) => j.id.toLowerCase().includes(f) || j.description.toLowerCase().includes(f)
    );

    listEl.innerHTML = filtered.length
      ? filtered
          .map(
            (j) => `
        <div class="list-item" data-job-id="${j.id}" style="min-height: 72px; padding: 10px 16px;">
          <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
            <span class="text-secondary" style="font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.04em;">Job #${j.id}</span>
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
        const job = MOCK_JOBS.find((j) => j.id === item.dataset.jobId);
        state.jobId = job.id;
        state.jobDescription = job.description;
        goToStep(2);
      });
    });
  }

  drawList();
  searchEl.addEventListener('input', (e) => drawList(e.target.value));
}

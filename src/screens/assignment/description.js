export function renderDescriptionStep(container, state, { goToStep }) {
  container.innerHTML = `
    <div style="flex: 1;">
      <label class="text-secondary" style="font-size: var(--text-sm); display: block; margin-bottom: var(--space-sm);">Description</label>
      <textarea id="desc-input" class="text-input" maxlength="200" placeholder="What was this purchase for?">${state.description}</textarea>
      <p class="text-secondary" id="desc-count" style="font-size: var(--text-xs); text-align: right; margin-top: var(--space-xs);">${state.description.length}/200</p>
    </div>
    <div class="bottom-action">
      <button id="desc-next" class="btn-primary">Next</button>
    </div>
  `;

  const textarea = container.querySelector('#desc-input');
  const count = container.querySelector('#desc-count');
  const nextBtn = container.querySelector('#desc-next');

  textarea.addEventListener('input', (e) => {
    state.description = e.target.value;
    count.textContent = `${e.target.value.length}/200`;
  });

  nextBtn.addEventListener('click', () => goToStep(3));
}

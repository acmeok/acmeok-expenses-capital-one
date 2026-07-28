import { icon } from '../../components/icon.js';

// Same candidate order/toggle mechanic as the reference voice app (David Voice Messaging App):
// tap-to-start, tap-to-stop on one button; getUserMedia -> pick supported mimeType -> MediaRecorder.
const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

function pickMimeType() {
  for (const type of MIME_CANDIDATES) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

function formatTimer(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function renderAudioStep(container, state, { goToStep }) {
  let recordState = state.audioBlob ? 'recorded' : 'idle'; // idle | recording | recorded
  let seconds = state.audioDuration || 0;
  let timerInterval = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let stream = null;
  let mimeType = '';
  let audioEl = state.audioUrl ? new Audio(state.audioUrl) : null;
  let isPlaying = false;

  container.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-lg);">
      <p style="color: var(--color-text-secondary); font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
        Audio note is required
      </p>
      <button id="record-btn" class="record-btn" aria-label="Record audio note"></button>
      <div id="record-meta" style="min-height: 48px; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);"></div>
      <p id="record-error" style="display: none; font-size: var(--text-sm); color: var(--color-danger); text-align: center; max-width: 280px;"></p>
    </div>
    <div class="bottom-action" id="audio-bottom"></div>
  `;

  const btn = container.querySelector('#record-btn');
  const metaEl = container.querySelector('#record-meta');
  const bottomEl = container.querySelector('#audio-bottom');
  const errorEl = container.querySelector('#record-error');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  function clearError() {
    errorEl.style.display = 'none';
  }

  function bindAudioElEvents() {
    if (!audioEl) return;
    audioEl.addEventListener('ended', () => {
      isPlaying = false;
      renderMeta();
    });
  }
  bindAudioElEvents();

  function renderMeta() {
    if (recordState === 'idle') {
      metaEl.innerHTML = `<span class="text-secondary" style="font-size: var(--text-sm);">Tap to start recording</span>`;
      return;
    }
    if (recordState === 'recording') {
      metaEl.innerHTML = `<span style="font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: var(--color-accent);">${formatTimer(seconds)}</span>`;
      return;
    }
    metaEl.innerHTML = `
      <button id="playback-btn" style="display: flex; align-items: center; justify-content: center; gap: var(--space-sm); min-height: 44px; background: var(--color-bg-surface); border: 1px solid var(--color-steel); border-radius: 10px; padding: 0 16px; color: var(--color-text-primary); cursor: pointer;">
        ${icon(isPlaying ? 'pause' : 'play', { size: 16 })} <span style="font-size: var(--text-sm);">${isPlaying ? 'Playing' : 'Play recording'} · ${formatTimer(seconds)}</span>
      </button>
      <button id="rerecord-btn" style="display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 var(--space-sm); background: none; border: none; color: var(--color-accent); font-size: var(--text-sm); font-weight: 600; cursor: pointer;">
        Re-record
      </button>
    `;

    metaEl.querySelector('#playback-btn').addEventListener('click', () => {
      if (!audioEl) return;
      if (isPlaying) {
        audioEl.pause();
        isPlaying = false;
      } else {
        audioEl.currentTime = 0;
        audioEl.play();
        isPlaying = true;
      }
      renderMeta();
    });

    metaEl.querySelector('#rerecord-btn').addEventListener('click', () => {
      if (audioEl) {
        audioEl.pause();
        audioEl = null;
      }
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
      recordState = 'idle';
      seconds = 0;
      isPlaying = false;
      state.audioBlob = null;
      state.audioUrl = null;
      state.audioDuration = 0;
      state.audioMimeType = null;
      clearError();
      updateAll();
    });
  }

  function renderBottom() {
    if (recordState !== 'recorded') {
      bottomEl.innerHTML = '';
      return;
    }
    bottomEl.innerHTML = `<button id="audio-next" class="btn-primary">Next</button>`;
    bottomEl.querySelector('#audio-next').addEventListener('click', () => goToStep(4));
  }

  function updateAll() {
    btn.className = [
      'record-btn',
      recordState === 'recording' ? 'recording' : '',
      recordState === 'recorded' ? 'recorded' : '',
    ]
      .filter(Boolean)
      .join(' ');
    btn.innerHTML =
      recordState === 'recording'
        ? icon('square', { size: 32 })
        : recordState === 'recorded'
          ? icon('check', { size: 36 })
          : icon('mic', { size: 36 });
    renderMeta();
    renderBottom();
  }

  async function startRecording() {
    clearError();
    audioChunks = [];

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      showError('Microphone access was denied or unavailable. Enable microphone permission in your browser settings and try again.');
      return;
    }

    mimeType = pickMimeType();
    const options = mimeType ? { mimeType } : undefined;

    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (err) {
      mediaRecorder = new MediaRecorder(stream);
      mimeType = mediaRecorder.mimeType || '';
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
      }

      const blob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
      state.audioBlob = blob;
      state.audioUrl = URL.createObjectURL(blob);
      state.audioDuration = seconds;
      state.audioMimeType = blob.type;

      audioEl = new Audio(state.audioUrl);
      bindAudioElEvents();

      recordState = 'recorded';
      updateAll();
    };

    recordState = 'recording';
    seconds = 0;
    timerInterval = setInterval(() => {
      seconds += 1;
      renderMeta();
    }, 1000);
    updateAll();

    mediaRecorder.start();
  }

  function stopRecording() {
    clearInterval(timerInterval);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  btn.addEventListener('click', () => {
    if (recordState === 'idle') {
      startRecording();
    } else if (recordState === 'recording') {
      stopRecording();
    }
  });

  updateAll();
}

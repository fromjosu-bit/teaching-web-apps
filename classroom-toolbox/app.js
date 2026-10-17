const app = document.querySelector('#app');

const programs = [
  {
    id: 'diary',
    title: '하루의 조각 · 일기장',
    description: 'Google 로그인 후 나만의 일기를 안전하게 기록하고 기기 간 이어서 사용합니다.',
    path: 'https://haru-diary-fromjosu-20261017.web.app',
    status: 'Google 로그인',
    visual: '하루',
    external: true,
  },
  {
    id: 'timer',
    title: '교실 타이머',
    description: '카운트다운, 스톱워치, 현재 시각을 한 화면에서 사용합니다.',
    path: '#/timer',
    status: '사용 가능',
    visual: '05:00',
    external: false,
  },
  {
    id: 'pdf-counter',
    title: 'PDF 글자 수 세기',
    description: 'PDF를 업로드하지 않고 브라우저 안에서 글자 수를 계산합니다.',
    path: '../pdf-character-counter/index.html',
    status: '로컬 처리',
    visual: '가나다',
    external: true,
  },
];

const state = {
  mode: 'timer',
  timer: { duration: 300_000, remaining: 300_000, running: false, endAt: 0, finished: false },
  stopwatch: { elapsed: 0, running: false, startedAt: 0 },
  muted: (() => { try { return localStorage.getItem('classroom-toolbox-muted') === 'true'; } catch { return false; } })(),
  controlsVisible: true,
  controlsTimer: null,
  ticker: null,
  audioContext: null,
};

const icons = {
  sound: '<span aria-hidden="true">◖)))</span>',
  muted: '<span aria-hidden="true">◖×</span>',
};

function pad(value) { return String(value).padStart(2, '0'); }

function formatDuration(ms, stopwatch = false) {
  const total = Math.max(0, stopwatch ? Math.floor(ms / 10) * 10 : Math.ceil(ms / 1000) * 1000);
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function nowText() {
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
}

function dateText() {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
}

function renderHub() {
  stopTicker();
  document.title = '교실 도구함';
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <span class="eyebrow">Classroom utility archive</span>
        <span class="eyebrow center-note">수업의 흐름을 한곳에서</span>
        <time class="clock-small" id="hub-clock">${nowText()}</time>
      </header>
      <h1 class="wordmark">교실 도구함</h1>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <h2 id="hero-title">배움의 시간은<br><em>선명하게</em> 흐릅니다.</h2>
          <p>교실에서 자주 쓰는 도구를 빠르게 열고, 학생들과 같은 순간을 바라보세요.</p>
        </div>
        <div class="hero-mark" aria-hidden="true">◷</div>
      </section>
      <section class="section" aria-labelledby="tools-title">
        <div class="section-head">
          <h2 id="tools-title">수업 도구</h2>
          <p>${programs.length}개의 도구</p>
        </div>
        <div class="card-grid">
          ${programs.map(program => `
            <article class="tool-card">
              <div class="card-visual" aria-hidden="true">${program.visual}</div>
              <div class="card-copy">
                <span class="meta">${program.status}</span>
                <h3>${program.title}</h3>
                <p>${program.description}</p>
                <a class="pill" href="${program.path}"${program.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>열기 →</a>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    </main>`;
  state.ticker = setInterval(() => {
    const clock = document.querySelector('#hub-clock');
    if (clock) clock.textContent = nowText();
  }, 1000);
}

function timerStatus() {
  if (state.timer.finished) return '시간 종료';
  if (state.timer.running) return '실행 중';
  if (state.timer.remaining < state.timer.duration) return '일시정지';
  return '준비';
}

function stopwatchElapsed() {
  return state.stopwatch.running ? state.stopwatch.elapsed + performance.now() - state.stopwatch.startedAt : state.stopwatch.elapsed;
}

function renderTool() {
  stopTicker();
  document.title = '교실 타이머 · 교실 도구함';
  app.innerHTML = `
    <main class="timer-page ${state.timer.finished && state.mode === 'timer' ? 'finished' : ''}" id="timer-page">
      <div class="timer-layout">
        <header class="timer-header">
          <a class="pill back" href="#/">← 도구함</a>
          <nav class="mode-tabs" aria-label="시간 도구 선택">
            <button class="pill ${state.mode === 'timer' ? 'active' : ''}" data-mode="timer">타이머</button>
            <button class="pill ${state.mode === 'stopwatch' ? 'active' : ''}" data-mode="stopwatch">스톱워치</button>
            <button class="pill ${state.mode === 'clock' ? 'active' : ''}" data-mode="clock">현재 시각</button>
          </nav>
          <time class="live-clock" id="live-clock">${nowText()}</time>
        </header>
        <section class="display-area" aria-live="polite">
          <p class="status-label" id="status-label">${state.mode === 'timer' ? timerStatus() : state.mode === 'stopwatch' ? (state.stopwatch.running ? '측정 중' : '스톱워치') : '현재 시각'}</p>
          <p class="time-display ${state.mode === 'clock' ? 'clock-mode' : ''}" id="time-display">${displayValue()}</p>
          ${state.mode === 'clock' ? `<p class="date-display" id="date-display">${dateText()}</p>` : ''}
        </section>
        <div class="control-dock" id="control-dock">
          ${controlsTemplate()}
          ${state.mode !== 'clock' ? '<p class="hint">Space 시작·정지 · R 초기화 · M 음소거 · F 전체화면</p>' : '<p class="hint">F 전체화면</p>'}
        </div>
      </div>
    </main>`;
  bindToolEvents();
  startTicker();
  noteActivity();
}

function displayValue() {
  if (state.mode === 'timer') return formatDuration(state.timer.remaining);
  if (state.mode === 'stopwatch') return formatDuration(stopwatchElapsed(), true);
  return nowText();
}

function controlsTemplate() {
  if (state.mode === 'clock') return `<div class="control-panel"><button class="pill" data-action="fullscreen">전체화면</button></div>`;
  if (state.mode === 'stopwatch') return `
    <div class="control-panel">
      <button class="pill" data-action="toggle-stopwatch">${state.stopwatch.running ? '일시정지' : state.stopwatch.elapsed > 0 ? '계속' : '시작'}</button>
      <button class="pill" data-action="reset-stopwatch">초기화</button>
      <button class="pill" data-action="fullscreen">전체화면</button>
    </div>`;
  return `
    <div class="control-panel">
      <button class="pill" data-preset="1">1분</button>
      <button class="pill" data-preset="3">3분</button>
      <button class="pill" data-preset="5">5분</button>
      <button class="pill" data-preset="10">10분</button>
      <div class="setup-fields" aria-label="시간 직접 입력">
        <input class="time-input" id="minutes" type="number" min="0" max="99" value="${Math.floor(state.timer.duration / 60000)}" aria-label="분" />
        <span class="separator">:</span>
        <input class="time-input" id="seconds" type="number" min="0" max="59" value="${Math.floor((state.timer.duration % 60000) / 1000)}" aria-label="초" />
      </div>
      <button class="pill" data-action="toggle-timer">${state.timer.running ? '일시정지' : state.timer.remaining < state.timer.duration && !state.timer.finished ? '계속' : '시작'}</button>
      <button class="pill" data-action="add-minute">+1분</button>
      <button class="pill" data-action="reset-timer">초기화</button>
      <button class="pill" data-action="mute" aria-pressed="${state.muted}">${state.muted ? icons.muted : icons.sound} ${state.muted ? '음소거됨' : '소리 켬'}</button>
      <button class="pill" data-action="fullscreen">전체화면</button>
      <p class="error" id="input-error" role="alert"></p>
    </div>`;
}

function bindToolEvents() {
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    renderTool();
  }));
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => setPreset(Number(button.dataset.preset))));
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action)));
  document.querySelectorAll('input').forEach(input => input.addEventListener('input', applyInputs));
}

function setPreset(minutes) {
  state.timer.duration = minutes * 60_000;
  state.timer.remaining = state.timer.duration;
  state.timer.running = false;
  state.timer.finished = false;
  renderTool();
}

function applyInputs() {
  const minutes = Number(document.querySelector('#minutes')?.value ?? 0);
  const seconds = Number(document.querySelector('#seconds')?.value ?? 0);
  const error = document.querySelector('#input-error');
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || minutes > 99 || seconds < 0 || seconds > 59 || minutes + seconds === 0) {
    if (error) error.textContent = '1초부터 99분 59초 사이로 입력해 주세요.';
    return false;
  }
  if (error) error.textContent = '';
  if (!state.timer.running) {
    state.timer.duration = (minutes * 60 + seconds) * 1000;
    state.timer.remaining = state.timer.duration;
    state.timer.finished = false;
    updateDisplay();
  }
  return true;
}

function handleAction(action) {
  if (action === 'toggle-timer') toggleTimer();
  if (action === 'reset-timer') resetTimer();
  if (action === 'add-minute') addMinute();
  if (action === 'mute') toggleMute();
  if (action === 'toggle-stopwatch') toggleStopwatch();
  if (action === 'reset-stopwatch') resetStopwatch();
  if (action === 'fullscreen') toggleFullscreen();
}

function toggleTimer() {
  if (state.timer.running) {
    state.timer.remaining = Math.max(0, state.timer.endAt - performance.now());
    state.timer.running = false;
  } else {
    if (!state.muted) prepareAudio();
    if (state.timer.finished || state.timer.remaining <= 0) {
      if (!applyInputs()) return;
      state.timer.remaining = state.timer.duration;
      state.timer.finished = false;
    } else if (state.timer.remaining === state.timer.duration && !applyInputs()) {
      return;
    }
    state.timer.endAt = performance.now() + state.timer.remaining;
    state.timer.running = true;
  }
  renderTool();
}

function resetTimer() {
  state.timer.running = false;
  state.timer.remaining = state.timer.duration;
  state.timer.finished = false;
  renderTool();
}

function addMinute() {
  state.timer.remaining += 60_000;
  state.timer.duration = Math.max(state.timer.duration, state.timer.remaining);
  if (state.timer.running) state.timer.endAt += 60_000;
  if (state.timer.finished) state.timer.finished = false;
  updateDisplay();
}

function toggleMute() {
  state.muted = !state.muted;
  try { localStorage.setItem('classroom-toolbox-muted', String(state.muted)); } catch { /* Keep this session usable when storage is blocked. */ }
  renderTool();
}

function toggleStopwatch() {
  if (state.stopwatch.running) {
    state.stopwatch.elapsed += performance.now() - state.stopwatch.startedAt;
    state.stopwatch.running = false;
  } else {
    state.stopwatch.startedAt = performance.now();
    state.stopwatch.running = true;
  }
  renderTool();
}

function resetStopwatch() {
  state.stopwatch.elapsed = 0;
  state.stopwatch.running = false;
  renderTool();
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {
    document.querySelector('#status-label').textContent = '전체화면을 허용해 주세요';
    document.querySelector('#timer-page')?.classList.add('fullscreen-active');
  }
  noteActivity();
}

function finishTimer() {
  state.timer.running = false;
  state.timer.remaining = 0;
  state.timer.finished = true;
  if (!state.muted) playEndTone();
  renderTool();
}

function playEndTone() {
  try {
    const context = prepareAudio();
    if (!context || context.state !== 'running') return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.setValueAtTime(880, context.currentTime + .18);
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.24, context.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .55);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .56);
  } catch { /* Visual completion remains available. */ }
}

function prepareAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!state.audioContext || state.audioContext.state === 'closed') state.audioContext = new AudioContext();
  if (state.audioContext.state === 'suspended') state.audioContext.resume();
  return state.audioContext;
}

function updateDisplay() {
  if (state.mode === 'timer' && state.timer.running) {
    state.timer.remaining = Math.max(0, state.timer.endAt - performance.now());
    if (state.timer.remaining <= 0) return finishTimer();
  }
  const display = document.querySelector('#time-display');
  const clock = document.querySelector('#live-clock');
  const date = document.querySelector('#date-display');
  const status = document.querySelector('#status-label');
  if (display) display.textContent = displayValue();
  if (clock) clock.textContent = nowText();
  if (date) date.textContent = dateText();
  if (status && state.mode === 'timer') status.textContent = timerStatus();
}

function startTicker() { state.ticker = setInterval(updateDisplay, 50); }
function stopTicker() { if (state.ticker) clearInterval(state.ticker); state.ticker = null; }

function noteActivity() {
  state.controlsVisible = true;
  document.querySelector('#control-dock')?.classList.remove('hidden');
  clearTimeout(state.controlsTimer);
  if (document.fullscreenElement || document.querySelector('#timer-page')?.classList.contains('fullscreen-active')) {
    state.controlsTimer = setTimeout(() => document.querySelector('#control-dock')?.classList.add('hidden'), 3000);
  }
}

function onKey(event) {
  if (!location.hash.startsWith('#/timer')) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.code === 'Space') { event.preventDefault(); state.mode === 'stopwatch' ? toggleStopwatch() : state.mode === 'timer' && toggleTimer(); }
  if (event.key.toLowerCase() === 'r') state.mode === 'stopwatch' ? resetStopwatch() : state.mode === 'timer' && resetTimer();
  if (event.key.toLowerCase() === 'm') toggleMute();
  if (event.key.toLowerCase() === 'f') toggleFullscreen();
  if ((event.key === '+' || event.key === 'ArrowUp') && state.mode === 'timer') addMinute();
}

function route() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  location.hash.startsWith('#/timer') ? renderTool() : renderHub();
}

window.addEventListener('hashchange', route);
window.addEventListener('keydown', onKey);
window.addEventListener('mousemove', noteActivity);
window.addEventListener('mousedown', noteActivity);
window.addEventListener('fullscreenchange', () => {
  document.querySelector('#timer-page')?.classList.toggle('fullscreen-active', Boolean(document.fullscreenElement));
  noteActivity();
});

route();

// app.js — Entry point

checkOllama();

// ── ANIMATED TAB SWITCHING ────────────────────────────────────
let currentTab    = 'chat';
let transitioning = false;

function switchTab(name) {
  if (name === currentTab || transitioning) return;
  transitioning = true;

  const fromPanel = document.getElementById('panel-' + currentTab);
  const toPanel   = document.getElementById('panel-' + name);
  const toVoice   = name === 'voice';

  // Update header + mobile tab buttons
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name)?.classList.add('active');
  document.querySelectorAll('.mob-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('mob-tab-' + name)?.classList.add('active');

  // Chat controls
  document.getElementById('chat-controls')?.classList.toggle('hidden', name !== 'chat');

  const exitClass  = toVoice ? 'anim-exit'  : 'anim-exit-rev';
  const enterClass = toVoice ? 'anim-enter' : 'anim-enter-rev';

  // Exit current panel
  fromPanel.classList.add(exitClass);

  setTimeout(() => {
    fromPanel.classList.remove('active', exitClass);

    // Enter new panel
    toPanel.classList.add(enterClass);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      toPanel.classList.add('active');
    }));

    setTimeout(() => {
      toPanel.classList.remove(enterClass);
      transitioning = false;
    }, 440);
  }, 390);

  currentTab = name;
  if (!window.JARVIS) window.JARVIS = {};
  window.JARVIS.tab = name;
  if (window.set3DState) window.set3DState('idle');
}

window.switchTab = switchTab;

// ── HOOK 3D STATE TO JARVIS VOICE STATE ──────────────────────
const hookInterval = setInterval(() => {
  if (window.JARVIS?.setState) {
    const orig = window.JARVIS.setState.bind(window.JARVIS);
    window.JARVIS.setState = function(state) {
      orig(state);
      if (window.set3DState) window.set3DState(state);
      if (window.setHero3DState) window.setHero3DState(state);
    };
    clearInterval(hookInterval);
  }
}, 100);

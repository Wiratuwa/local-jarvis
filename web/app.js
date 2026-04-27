// app.js — Entry point

checkOllama();

// ── THEME TOGGLE ──────────────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const rootEl = document.documentElement;

function setTheme(isLight) {
  if (isLight) {
    rootEl.classList.add('theme-light');
    localStorage.setItem('jarvis-theme', 'light');
    themeToggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  } else {
    rootEl.classList.remove('theme-light');
    localStorage.setItem('jarvis-theme', 'dark');
    themeToggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  }
}

// Load saved theme
if (localStorage.getItem('jarvis-theme') === 'light') {
  setTheme(true);
}

themeToggleBtn?.addEventListener('click', () => {
  const isLight = !rootEl.classList.contains('theme-light');
  setTheme(isLight);
});


// ── SIDEBAR COLLAPSE ──────────────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const collapseBtn   = document.getElementById('sidebar-collapse-btn');
const openBtn       = document.getElementById('sidebar-open-btn');
const appShell      = document.getElementById('app-shell');
const isMobile      = () => window.innerWidth <= 479;

function collapseSidebar() {
  sidebar.classList.add('collapsed');
  document.body.classList.add('sidebar-collapsed');
}
function expandSidebar() {
  if (isMobile()) {
    sidebar.classList.add('mobile-open');
  } else {
    sidebar.classList.remove('collapsed');
    document.body.classList.remove('sidebar-collapsed');
  }
}

collapseBtn?.addEventListener('click', () => {
  if (isMobile()) {
    sidebar.classList.remove('mobile-open');
  } else if (sidebar.classList.contains('collapsed')) {
    expandSidebar();
  } else {
    collapseSidebar();
  }
});
openBtn?.addEventListener('click', expandSidebar);

// Close mobile sidebar when clicking outside
document.addEventListener('click', e => {
  if (isMobile() && sidebar.classList.contains('mobile-open')) {
    if (!sidebar.contains(e.target) && e.target !== openBtn) {
      sidebar.classList.remove('mobile-open');
    }
  }
});

// ── ANIMATED TAB SWITCHING ────────────────────────────────────
let currentTab    = 'chat';
let transitioning = false;

function switchTab(name) {
  if (name === currentTab || transitioning) return;
  transitioning = true;

  const fromPanel = document.getElementById('panel-' + currentTab);
  const toPanel   = document.getElementById('panel-' + name);
  const toVoice   = name === 'voice';

  // Update sidebar tab buttons
  document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name)?.classList.add('active');
  document.querySelectorAll('.mob-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('mob-tab-' + name)?.classList.add('active');

  const exitClass  = toVoice ? 'anim-exit'  : 'anim-exit-rev';
  const enterClass = toVoice ? 'anim-enter' : 'anim-enter-rev';

  fromPanel.classList.add(exitClass);

  setTimeout(() => {
    fromPanel.classList.remove('active', exitClass);
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
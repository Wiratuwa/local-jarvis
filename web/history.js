// history.js — Chat session persistence via IndexedDB

const DB_NAME           = 'jarvis_db';
const DB_VERSION        = 1;
const STORE_SESSIONS    = 'sessions';
const MAX_SESSIONS      = 60;
const SESSION_TITLE_MAX = 40;

let db               = null;
let currentSessionId = null;

// ══════════════════════════════════════════════════════════════
// INDEXEDDB SETUP
// ══════════════════════════════════════════════════════════════
function openDB() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_SESSIONS)) {
        const store = d.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror   = e => reject(e.target.error);
  });
}

async function dbGetAll() {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(STORE_SESSIONS, 'readonly')
                  .objectStore(STORE_SESSIONS)
                  .index('createdAt').getAll();
    req.onsuccess = e => resolve([...e.target.result].reverse()); // newest first
    req.onerror   = e => reject(e.target.error);
  });
}

async function dbGet(id) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(STORE_SESSIONS, 'readonly')
                  .objectStore(STORE_SESSIONS).get(id);
    req.onsuccess = e => resolve(e.target.result || null);
    req.onerror   = e => reject(e.target.error);
  });
}

async function dbPut(session) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(STORE_SESSIONS, 'readwrite')
                  .objectStore(STORE_SESSIONS).put(session);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

async function dbDelete(id) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(STORE_SESSIONS, 'readwrite')
                  .objectStore(STORE_SESSIONS).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

async function dbClear() {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(STORE_SESSIONS, 'readwrite')
                  .objectStore(STORE_SESSIONS).clear();
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

async function dbTrim() {
  const all = await dbGetAll();
  if (all.length <= MAX_SESSIONS) return;
  for (const s of all.slice(MAX_SESSIONS)) await dbDelete(s.id);
}

// ══════════════════════════════════════════════════════════════
// SESSION LIFECYCLE
// ══════════════════════════════════════════════════════════════
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function createSession(firstUserMsg) {
  const title = firstUserMsg.slice(0, SESSION_TITLE_MAX) +
                (firstUserMsg.length > SESSION_TITLE_MAX ? '…' : '');
  const session = {
    id:        makeId(),
    title,
    createdAt: Date.now(),
    messages:  [...(window.chatHistory || [])]
  };
  await dbPut(session);
  await dbTrim();
  currentSessionId = session.id;
  await renderHistory();
  return session.id;
}

async function saveCurrentSession() {
  if (!currentSessionId) return;
  const session = await dbGet(currentSessionId);
  if (!session) return;
  session.messages = [...(window.chatHistory || [])];
  await dbPut(session);
}

async function deleteSession(id, e) {
  e?.stopPropagation();
  await dbDelete(id);
  if (currentSessionId === id) currentSessionId = null;
  await renderHistory();
}

async function clearAllSessions() {
  if (!confirm('Clear all chat history?')) return;
  await dbClear();
  currentSessionId = null;
  await renderHistory();
}

// ══════════════════════════════════════════════════════════════
// RESTORE
// ══════════════════════════════════════════════════════════════
async function restoreSession(id) {
  if (id === currentSessionId) return;
  await saveCurrentSession();

  const session = await dbGet(id);
  if (!session) return;

  _clearChatUI();
  currentSessionId = id;

  window.chatHistory.length = 0;
  session.messages.forEach(msg => {
    window.chatHistory.push(msg);
    if (msg.role !== 'system') window.addMessage(msg.role, msg.content);
  });

  await renderHistory();
  if (window.JARVIS?.tab !== 'chat') window.switchTab('chat');
}

// ══════════════════════════════════════════════════════════════
// NEW CHAT
// ══════════════════════════════════════════════════════════════
async function newChat(saveFirst = true) {
  if (saveFirst) await saveCurrentSession();
  currentSessionId = null;
  window.chatHistory.length = 0;
  _clearChatUI();
  await renderHistory();
}

function _clearChatUI() {
  const chatEl  = document.getElementById('chat');
  const emptyEl = document.getElementById('empty');
  if (chatEl) [...chatEl.children].forEach(c => { if (c.id !== 'empty') c.remove(); });
  if (emptyEl) emptyEl.style.display = 'flex';
  const inputEl = document.getElementById('input');
  if (inputEl) { inputEl.value = ''; inputEl.style.height = 'auto'; }
}

// ══════════════════════════════════════════════════════════════
// RENDER SIDEBAR HISTORY
// ══════════════════════════════════════════════════════════════
async function renderHistory() {
  const container = document.getElementById('sidebar-history');
  if (!container) return;

  let sessions;
  try { sessions = await dbGetAll(); }
  catch { sessions = []; }

  if (!sessions.length) {
    container.innerHTML = '<div class="history-empty">No history yet</div>';
    return;
  }

  container.innerHTML = sessions.map(s => `
    <div class="history-item${s.id === currentSessionId ? ' active' : ''}" data-id="${s.id}">
      <span class="history-item-text" title="${escHtml(s.title)}">${escHtml(s.title)}</span>
      <button class="history-item-del" data-del="${s.id}" title="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => restoreSession(el.dataset.id));
  });
  container.querySelectorAll('.history-item-del').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteSession(btn.dataset.del); });
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════════════════════
// AI TITLE SUMMARIZATION
// ══════════════════════════════════════════════════════════════
let isSummarizing = false;

async function updateSessionTitleWithAI(id) {
  if (isSummarizing || !window.OLLAMA_URL || !window.modelSelect) return;
  const session = await dbGet(id);
  if (!session || !session.messages || session.messages.length < 2) return;

  const recent = session.messages.filter(m => m.role !== 'system').slice(-6);
  const prompt = {
    role: 'system',
    content: 'Summarize the core topic of the following conversation in 2 to 4 words. Return ONLY the short title. Do not use quotes, punctuation, or say "The topic is". Just the title.'
  };

  isSummarizing = true;
  try {
    const response = await fetch(`${window.OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: window.modelSelect.value,
        messages: [prompt, ...recent],
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      let newTitle = data.message?.content?.trim() || '';
      newTitle = newTitle.replace(/^(here is.*?:|title:|topic:|\*\*title:\*\*|\*\*topic:\*\*)\s*/i, '').replace(/^["'*]+|["'*]+$/g, '').trim();
      if (newTitle) {
        if (newTitle.length > 35) newTitle = newTitle.slice(0, 35) + '…';
        session.title = newTitle;
        await dbPut(session);
        await renderHistory();
      }
    }
  } catch (e) {
    // Ignore summarization errors quietly
  } finally {
    isSummarizing = false;
  }
}

// ══════════════════════════════════════════════════════════════
// HOOK INTO chat.js sendMessage (wraps it post-load)
// ══════════════════════════════════════════════════════════════
(function hookChatHistory() {
  const wait = setInterval(() => {
    if (typeof window.sendMessage !== 'function') return;
    clearInterval(wait);

    const orig = window.sendMessage;
    window.sendMessage = async function(text) {
      const isFirst = !currentSessionId && (window.chatHistory?.length ?? 0) === 0;
      await orig(text);
      if (isFirst) {
        const firstMsg = window.chatHistory?.find(m => m.role === 'user');
        if (firstMsg) {
          const sid = await createSession(firstMsg.content);
          updateSessionTitleWithAI(sid);
        }
      } else if (currentSessionId) {
        await saveCurrentSession();
        const userCount = window.chatHistory.filter(m => m.role === 'user').length;
        if (userCount > 1 && userCount % 3 === 0) {
          updateSessionTitleWithAI(currentSessionId);
        }
      }
    };
  }, 50);
})();

// ══════════════════════════════════════════════════════════════
// EXPOSE GLOBALS
// ══════════════════════════════════════════════════════════════
window.newChat            = newChat;
window.restoreSession     = restoreSession;
window.deleteSession      = deleteSession;
window.clearAllSessions   = clearAllSessions;
window.saveCurrentSession = saveCurrentSession;

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  await openDB();
  await renderHistory();

  document.getElementById('btn-new-chat')
    ?.addEventListener('click', () => newChat());
  document.getElementById('btn-clear-all')
    ?.addEventListener('click', clearAllSessions);
});
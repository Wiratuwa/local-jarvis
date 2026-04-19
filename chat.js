// chat.js — Ollama API integration & message rendering

const OLLAMA_URL = 'http://localhost:11434';

const chatEl      = document.getElementById('chat');
const emptyEl     = document.getElementById('empty');
const inputEl     = document.getElementById('input');
const sendBtn     = document.getElementById('send');
const dotEl       = document.getElementById('dot');
const statusEl    = document.getElementById('status-text');
const errorBar    = document.getElementById('error-bar');
const modelSelect = document.getElementById('model-select');

// System prompt — language-adaptive JARVIS personality
const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are JARVIS, a highly intelligent local AI assistant inspired by Iron Man's AI.
Always detect the language the user is writing or speaking in, and respond entirely in that same language.
Use natural grammar, vocabulary, and expressions native to that language — never mix languages unless the user does.
Match the user's level of formality. If the user speaks Indonesian, respond in natural Indonesian. If Japanese, respond in natural Japanese. And so on.
Be concise, sharp, and helpful. Avoid unnecessary filler phrases.`
};

let history = [];
let busy    = false;

// ── OLLAMA STATUS CHECK ────────────────────────────────────────
async function checkOllama() {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!r.ok) throw new Error();
    const data = await r.json();
    dotEl.className = 'dot online';
    const count = data.models?.length || 0;
    statusEl.textContent = `ONLINE · ${count} MODEL${count !== 1 ? 'S' : ''} LOADED`;
    if (data.models?.length) {
      const names = data.models.map(m => m.name.split(':')[0]);
      if (!names.includes(modelSelect.value) && names.length) {
        modelSelect.value = data.models[0].name.split(':')[0];
      }
    }
  } catch {
    dotEl.className = 'dot error';
    statusEl.textContent = 'OFFLINE — RUN: ollama serve';
  }
}

// ── ERROR BAR ─────────────────────────────────────────────────
function showError(msg) {
  errorBar.textContent = '⚠ ' + msg;
  errorBar.style.display = 'block';
  setTimeout(() => { errorBar.style.display = 'none'; }, 6000);
}

// ── MESSAGE RENDERING ─────────────────────────────────────────
function addMessage(role, content) {
  emptyEl.style.display = 'none';
  const el    = document.createElement('div');
  el.className = `message ${role}`;
  const label  = role === 'user' ? 'YOU' : modelSelect.value.toUpperCase();
  el.innerHTML = `<div class="meta">${label}</div><div class="bubble"></div>`;
  chatEl.appendChild(el);
  if (content) el.querySelector('.bubble').textContent = content;
  chatEl.scrollTop = chatEl.scrollHeight;
  return el.querySelector('.bubble');
}

function addThinking() {
  emptyEl.style.display = 'none';
  const el    = document.createElement('div');
  el.className = 'message assistant';
  el.id        = 'thinking-msg';
  el.innerHTML = `<div class="meta">${modelSelect.value.toUpperCase()}</div>
    <div class="bubble"><div class="thinking"><span></span><span></span><span></span></div></div>`;
  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
  return el;
}

// ── SEND MESSAGE ──────────────────────────────────────────────
async function sendMessage(text) {
  text = text || inputEl.value.trim();
  if (!text || busy) return;

  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.cancel();
    if (window.setSpeaking) setSpeaking(false);
  }

  inputEl.value = '';
  inputEl.style.height = 'auto';
  addMessage('user', text);
  history.push({ role: 'user', content: text });

  busy = true;
  sendBtn.disabled = true;
  if (window.voiceBtn) voiceBtn.disabled = true;

  const thinkingEl = addThinking();

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelSelect.value,
        // Always prepend system prompt so JARVIS identity is consistent
        messages: [SYSTEM_PROMPT, ...history],
        stream: true
      })
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status} ${response.statusText}`);

    thinkingEl.remove();
    const bubble  = addMessage('assistant', '');
    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            full += data.message.content;
            bubble.textContent = full;
            chatEl.scrollTop = chatEl.scrollHeight;
          }
        } catch { /* partial JSON, skip */ }
      }
    }

    history.push({ role: 'assistant', content: full });

    const ttsOn = document.getElementById('tts-toggle')?.checked;
    if (ttsOn && full.trim() && window.speakText) {
      speakText(full);
    }

  } catch (err) {
    thinkingEl.remove();
    showError(err.message.includes('fetch')
      ? 'Cannot reach Ollama. Start it with: OLLAMA_ORIGINS=* ollama serve'
      : err.message);
  }

  busy = false;
  sendBtn.disabled = false;
  if (window.voiceBtn) voiceBtn.disabled = false;
  inputEl.focus();
}

// ── TEXTAREA AUTO-RESIZE ──────────────────────────────────────
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', () => sendMessage());

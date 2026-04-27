// chat.js — Ollama API integration & message rendering

const OLLAMA_URL = 'http://localhost:11434';
window.OLLAMA_URL = OLLAMA_URL;

const chatEl      = document.getElementById('chat');
const emptyEl     = document.getElementById('empty');
const inputEl     = document.getElementById('input');
const sendBtn     = document.getElementById('send');
const dotEl       = document.getElementById('dot');
const statusEl    = document.getElementById('status-text');
const errorBar    = document.getElementById('error-bar');
const modelSelect = document.getElementById('model-select');
window.modelSelect = modelSelect;

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are JARVIS, a highly intelligent local AI assistant inspired by Iron Man's AI.
Always respond in English only, regardless of what language the user writes in.
You have a Gen Z personality — casual, witty, and direct. Use modern slang naturally but don't overdo it.
Be concise and sharp. Skip the corporate filler.

COMPUTER CONTROL CAPABILITIES:
You can perform real-time web searches and access local files on the Desktop.
To use a tool, you MUST output a command in this EXACT format on its own line:
[EXEC: python execution/search_web.py --search "query"]
[EXEC: python execution/search_web.py --url "url"]
[EXEC: python execution/desktop_ops.py --list]
[EXEC: python execution/desktop_ops.py --read "filename"]
[EXEC: python execution/desktop_ops.py --write "filename" --content "data"]

Wait for the tool output before continuing your response. You can use multiple tools in sequence if needed.`
};

async function executeTool(command) {
  try {
    const r = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    const data = await r.json();
    if (data.error) return `Error: ${data.error}`;
    return data.stdout || data.stderr || 'Command executed with no output.';
  } catch (err) {
    return `Connection error: ${err.message}`;
  }
}

let chatHistory = [];
window.chatHistory = chatHistory; // exposed for history.js session saving
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
window.addMessage = addMessage;

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

// ── REAL-TIME SENTENCE STREAMING TTS ─────────────────────────
let ttsQueue      = [];
let ttsBusy       = false;
let ttsStreamDone = false;

function flushSentenceBuffer(buffer, force = false) {
  const sentences = [];
  const re = /(.{40,}?)([.!?]+)(?=\s|$)(?![\w])/g;
  let lastIndex = 0;
  let match;
  while ((match = re.exec(buffer)) !== null) {
    const s = (match[1] + match[2]).trim();
    if (s.length >= 10) sentences.push(s);
    lastIndex = re.lastIndex;
  }
  const remaining = buffer.slice(lastIndex);
  if (force && remaining.trim().length >= 10) {
    sentences.push(remaining.trim());
    return { sentences, remaining: '' };
  }
  return { sentences, remaining };
}

// Immediately fetch audio in the background and return a Promise
async function prepareAudioChunk(text) {
  const clean = text
    .replace(/```[\s\S]*?```/g, 'code block.')
    .replace(/`[^`]+`/g, '')
    .replace(/[*_#>~]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (!clean) return null;

  const KOKORO_URL   = 'http://localhost:8880';
  const KOKORO_VOICE = 'am_adam';

  try {
    const r = await fetch(`${KOKORO_URL}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'kokoro', input: clean, voice: KOKORO_VOICE, response_format: 'mp3', speed: 1.0 })
    });
    if (!r.ok) throw new Error();
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    return { type: 'kokoro', url };
  } catch (err) {
    return { type: 'browser', text: clean };
  }
}

// Playback loop consumes the pre-fetched audio promises
async function processTTSQueue() {
  if (ttsBusy) return;
  ttsBusy = true;
  while (ttsQueue.length > 0 || !ttsStreamDone) {
    if (ttsQueue.length === 0) {
      await new Promise(r => setTimeout(r, 60));
      continue;
    }
    
    // Shift the Promise off the queue and wait for it to resolve
    const audioPromise = ttsQueue.shift();
    if (audioPromise) {
      try {
        const playable = await audioPromise;
        await playChunk(playable);
      } catch (_) { /* continue on error */ }
    }
  }
  ttsBusy = false;
}

function playChunk(playable) {
  return new Promise(resolve => {
    if (!playable) { resolve(); return; }

    if (playable.type === 'kokoro') {
      const audio = new Audio(playable.url);
      audio.onended = () => { URL.revokeObjectURL(playable.url); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(playable.url); resolve(); };
      audio.play();
    } else {
      if (!window.speechSynthesis) { resolve(); return; }
      const utt = new SpeechSynthesisUtterance(playable.text);
      utt.rate = 1.15; utt.pitch = 1.1; utt.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(v => /en/i.test(v.lang));
      if (v) utt.voice = v;
      utt.onend = resolve;
      utt.onerror = resolve;
      window.speechSynthesis.speak(utt);
    }
  });
}

// ── SEND MESSAGE ──────────────────────────────────────────────
async function sendMessage(text) {
  text = text || inputEl.value.trim();
  if (!text || busy) return;

  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.cancel();
    if (window.setSpeaking) window.setSpeaking(false);
  }

  inputEl.value        = '';
  inputEl.style.height = 'auto';

  const inVoiceTab = window.JARVIS?.tab === 'voice';

  if (!inVoiceTab) addMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  busy = true;
  sendBtn.disabled = true;

  const thinkingEl = inVoiceTab ? null : addThinking();
  if (inVoiceTab) window.JARVIS?.setState('thinking');

  // Reset streaming TTS state
  ttsQueue      = [];
  ttsBusy       = false;
  ttsStreamDone = false;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelSelect.value,
        messages: [SYSTEM_PROMPT, ...chatHistory],
        stream: true
      })
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status} ${response.statusText}`);

    if (thinkingEl) thinkingEl.remove();
    const bubble  = inVoiceTab ? null : addMessage('assistant', '');
    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let full      = '';
    let sentBuf   = ''; // buffer for sentence-splitting TTS

    const ttsOn   = document.getElementById('tts-toggle')?.checked;
    const doRealtimeTTS = !inVoiceTab && ttsOn; // real-time TTS only in chat tab

    // Start TTS queue processor immediately if we'll use it
    if (doRealtimeTTS) processTTSQueue();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            const tok = data.message.content;
            full    += tok;
            sentBuf += tok;
            if (bubble) { bubble.textContent = full; chatEl.scrollTop = chatEl.scrollHeight; }

            // Tool Execution Check
            const execMatch = full.match(/\[EXEC: (python execution\/.*?)\]/);
            if (execMatch) {
              const cmd = execMatch[1];
              // Temporarily pause UI while executing
              const toolEl = document.createElement('div');
              toolEl.className = 'tool-executing';
              toolEl.textContent = `⚡ JARVIS EXECUTING: ${cmd}...`;
              chatEl.appendChild(toolEl);
              
              const toolOutput = await executeTool(cmd);
              toolEl.remove();
              
              // Append result to history and RE-TRIGGER LLM to process results
              chatHistory.push({ role: 'assistant', content: full });
              chatHistory.push({ role: 'user', content: `TOOL OUTPUT:\n${toolOutput}\n\nContinue based on this data.` });
              
              // Recurse to handle the result
              busy = false;
              return sendMessage(""); 
            }

            // Real-time: flush complete sentences into TTS queue
            if (doRealtimeTTS) {
              const { sentences, remaining } = flushSentenceBuffer(sentBuf);
              if (sentences.length) {
                sentences.forEach(s => ttsQueue.push(prepareAudioChunk(s)));
                sentBuf = remaining;
              }
            }
          }
        } catch { /* partial JSON */ }
      }
    }

    chatHistory.push({ role: 'assistant', content: full });

    if (doRealtimeTTS) {
      // Flush any remaining partial sentence
      const { sentences } = flushSentenceBuffer(sentBuf, true);
      if (sentences.length) {
        sentences.forEach(s => ttsQueue.push(prepareAudioChunk(s)));
      }
      ttsStreamDone = true;
      // processTTSQueue is already running
    } else if (inVoiceTab) {
      // Voice tab: speak full response at end (existing behaviour)
      if (full.trim() && window.speakText) {
        window.speakText(full);
      } else {
        window.JARVIS?.onSpeakEnd();
      }
    }
    // If TTS toggle off and chat tab: nothing to speak

  } catch (err) {
    if (thinkingEl) thinkingEl.remove();
    ttsStreamDone = true;
    showError(err.message.includes('fetch')
      ? 'Cannot reach Ollama. Start it with: OLLAMA_ORIGINS=* ollama serve'
      : err.message);
    if (inVoiceTab) window.JARVIS?.setState('idle');
  }

  busy = false;
  sendBtn.disabled = false;
  if (!inVoiceTab) inputEl.focus();
}

// ── TEXTAREA AUTO-RESIZE ──────────────────────────────────────
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
});

window.sendMessage = sendMessage;

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendMessage(); }
});

sendBtn.addEventListener('click', () => window.sendMessage());
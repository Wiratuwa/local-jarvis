// voice.js — Web Speech API voice input + Kokoro/browser TTS
// Two tabs: CHAT (wake word mode) | VOICE (auto-conversation loop)

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════
const KOKORO_URL       = 'http://localhost:8880';
const KOKORO_VOICE     = 'am_adam';
const WAKE_WORDS       = ['jarvis', 'hey jarvis', 'ok jarvis', 'yo jarvis', 'wake up'];
const PROMPT_MAX_MS    = 15000;
const PROMPT_SETTLE_MS = 900;
const PROMPT_LINGER_MS = 1200;

// ── DOM refs ─────────────────────────────────────────────────
const voiceBtn       = document.getElementById('voice-btn');
const speakBar       = document.getElementById('speaking-bar');
const liveTranscript = document.getElementById('transcript-live');
const wakeBtn        = document.getElementById('wake-btn');
const voiceOrb       = document.getElementById('voice-orb');
const orbWave        = document.getElementById('orb-wave');
const voiceStateEl   = document.getElementById('voice-state');
const voiceYouEl     = document.getElementById('voice-you');
const voiceReplyEl   = document.getElementById('voice-reply');
const voicePTTBtn    = document.getElementById('voice-ptt');

// ══════════════════════════════════════════════════════════════
// GLOBAL JARVIS NAMESPACE — used by chat.js safely
// ══════════════════════════════════════════════════════════════
window.JARVIS = {
  tab: 'chat',
  setState: (s) => setVoiceState(s),
  onSpeakEnd: () => {
    if (window.JARVIS.tab === 'voice') {
      setTimeout(startVoiceLoop, 800);
    }
  }
};

// ══════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════
let isListening     = false;
let speaking        = false;
let wakeWordActive  = false;
let activeAudio     = null;
let promptTimeout   = null;
let lingerTimeout   = null;
let intentionalStop = false;
let voiceLoopOn     = false;

// ══════════════════════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════════════════════
function switchTab(tab) {
  window.JARVIS.tab = tab;

  document.getElementById('panel-chat').classList.toggle('active', tab === 'chat');
  document.getElementById('panel-voice').classList.toggle('active', tab === 'voice');
  document.getElementById('tab-chat').classList.toggle('active', tab === 'chat');
  document.getElementById('tab-voice').classList.toggle('active', tab === 'voice');
  document.getElementById('chat-controls').classList.toggle('hidden', tab === 'voice');

  if (tab === 'voice') {
    // Stop chat wake word
    wakeWordActive = false;
    stopWakeWord();
    updateWakeUI();
    // Start voice loop
    voiceLoopOn = true;
    setVoiceState('idle');
    stopSpeech();
    setTimeout(startVoiceLoop, 400);
  } else {
    // Stop voice loop
    voiceLoopOn     = false;
    intentionalStop = true;
    try { promptRecognition?.stop(); } catch (_) {}
    stopSpeech();
    // Restore chat wake word
    wakeWordActive = true;
    setTimeout(() => { try { wakeRecognition?.start(); } catch (_) {} }, 400);
    updateWakeUI();
  }
}
window.switchTab = switchTab;

// ══════════════════════════════════════════════════════════════
// VOICE TAB — orb UI
// ══════════════════════════════════════════════════════════════
const STATE_LABELS = { idle: 'IDLE', listening: 'LISTENING', thinking: 'THINKING…', speaking: 'SPEAKING' };

function setVoiceState(state) {
  if (voiceOrb) voiceOrb.className = 'voice-orb' + (state !== 'idle' ? ' ' + state : '');
  if (voiceStateEl) {
    voiceStateEl.className   = 'voice-state' + (state !== 'idle' ? ' ' + state : '');
    voiceStateEl.textContent = STATE_LABELS[state] || 'IDLE';
  }
  if (orbWave) orbWave.classList.toggle('active', state === 'listening');
  if (voicePTTBtn) {
    voicePTTBtn.classList.toggle('active', state === 'listening');
    voicePTTBtn.disabled = (state === 'thinking' || state === 'speaking');
    voicePTTBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>${state === 'listening' ? ' LISTENING…' : ' TAP TO SPEAK'}`;
  }
}

function showVoiceYou(text) {
  if (!voiceYouEl) return;
  voiceYouEl.textContent = text;
  voiceYouEl.classList.add('visible');
}
function showVoiceReply(text) {
  if (!voiceReplyEl) return;
  voiceReplyEl.textContent = text;
  voiceReplyEl.classList.add('visible');
}
function clearVoiceExchange() {
  if (voiceYouEl)   { voiceYouEl.textContent   = ''; voiceYouEl.classList.remove('visible');   }
  if (voiceReplyEl) { voiceReplyEl.textContent  = ''; voiceReplyEl.classList.remove('visible'); }
}

// ══════════════════════════════════════════════════════════════
// VOICE LOOP
// ══════════════════════════════════════════════════════════════
function startVoiceLoop() {
  if (!voiceLoopOn || isListening || busy) return;
  clearVoiceExchange();
  intentionalStop = false;
  inputEl.value   = '';
  setVoiceState('listening');
  try { promptRecognition?.start(); } catch (_) {}
}

function voicePTT() {
  if (!voiceLoopOn) return;
  if (isListening) {
    intentionalStop = true;
    try { promptRecognition?.stop(); } catch (_) {}
  } else {
    stopSpeech();
    startVoiceLoop();
  }
}
window.voicePTT = voicePTT;

// ══════════════════════════════════════════════════════════════
// WAKE SOUND
// ══════════════════════════════════════════════════════════════
function playWakeSound() {
  try {
    const ctx   = new (window.AudioContext || window.webkitAudioContext)();
    const tones = [523, 784];
    tones.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.18);
      osc.start(t0); osc.stop(t0 + 0.2);
    });
  } catch (e) {}
}

// ══════════════════════════════════════════════════════════════
// SPEECH RECOGNITION
// ══════════════════════════════════════════════════════════════
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let wakeRecognition   = null;
let promptRecognition = null;

if (SpeechRecognition) {

  // ── WAKE WORD (chat tab only) ───────────────────────────────
  wakeRecognition = new SpeechRecognition();
  wakeRecognition.continuous     = true;
  wakeRecognition.interimResults = true;
  wakeRecognition.lang           = 'en-US';

  wakeRecognition.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const heard = e.results[i][0].transcript.toLowerCase().trim();
      if (WAKE_WORDS.some(w => heard.includes(w))) {
        stopWakeWord();
        playWakeSound();
        liveTranscript.textContent = '🎙 Ready…';
        liveTranscript.classList.add('active');
        setTimeout(startChatPrompt, PROMPT_SETTLE_MS);
        break;
      }
    }
  };

  wakeRecognition.onend = () => {
    if (wakeWordActive && !isListening) {
      setTimeout(() => { try { wakeRecognition.start(); } catch (_) {} }, 300);
    }
  };

  wakeRecognition.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    if (wakeWordActive && !isListening) {
      setTimeout(() => { try { wakeRecognition.start(); } catch (_) {} }, 1000);
    }
  };

  // ── PROMPT RECOGNIZER (shared by both tabs) ─────────────────
  promptRecognition = new SpeechRecognition();
  promptRecognition.continuous     = true;
  promptRecognition.interimResults = true;
  promptRecognition.lang           = ''; // auto-detect

  promptRecognition.onstart = () => {
    isListening = true;
    if (voiceBtn) voiceBtn.classList.add('listening');

    if (window.JARVIS.tab === 'chat') {
      liveTranscript.textContent = '🎙 Listening…';
      liveTranscript.classList.add('active');
    }

    clearTimeout(promptTimeout);
    promptTimeout = setTimeout(() => {
      intentionalStop = true;
      try { promptRecognition?.stop(); } catch (_) {}
    }, PROMPT_MAX_MS);
  };

  promptRecognition.onresult = (e) => {
    let interim = '', finalText = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interim += t;
    }

    if (window.JARVIS.tab === 'chat') {
      liveTranscript.textContent = '🎙 ' + (finalText || interim || 'Listening…');
    }

    if (finalText) {
      inputEl.value = (inputEl.value + ' ' + finalText).trim();
      if (window.JARVIS.tab === 'voice') showVoiceYou(inputEl.value);

      clearTimeout(lingerTimeout);
      lingerTimeout = setTimeout(() => {
        intentionalStop = true;
        try { promptRecognition?.stop(); } catch (_) {}
      }, PROMPT_LINGER_MS);
    }
  };

  promptRecognition.onend = () => {
    // Edge killed it early — restart if we didn't intend to stop
    if (!intentionalStop && isListening) {
      setTimeout(() => { try { promptRecognition.start(); } catch (_) {} }, 150);
      return;
    }

    clearTimeout(promptTimeout);
    clearTimeout(lingerTimeout);
    intentionalStop = false;
    isListening     = false;
    if (voiceBtn) voiceBtn.classList.remove('listening');

    const text = inputEl.value.trim();

    if (window.JARVIS.tab === 'chat') {
      liveTranscript.classList.remove('active');
      if (text && !busy) sendMessage(text);
      if (wakeWordActive) {
        setTimeout(() => { try { wakeRecognition.start(); } catch (_) {} }, 600);
      }
    } else {
      // Voice tab
      if (text && !busy) {
        setVoiceState('thinking');
        sendMessage(text);
      } else if (voiceLoopOn) {
        setTimeout(startVoiceLoop, 800);
      }
    }
  };

  promptRecognition.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    intentionalStop = true;
    clearTimeout(promptTimeout);
    clearTimeout(lingerTimeout);
    isListening = false;
    if (voiceBtn) voiceBtn.classList.remove('listening');
    liveTranscript.classList.remove('active');
    showError('Microphone error: ' + e.error);
    if (wakeWordActive) {
      setTimeout(() => { try { wakeRecognition.start(); } catch (_) {} }, 600);
    }
  };

} else {
  // No Web Speech API
  [voiceBtn, wakeBtn, voicePTTBtn].forEach(b => {
    if (b) { b.disabled = true; b.style.opacity = '0.3'; }
  });
}

// ══════════════════════════════════════════════════════════════
// CHAT TAB CONTROLS
// ══════════════════════════════════════════════════════════════
function startChatPrompt() {
  if (!promptRecognition || busy) return;
  intentionalStop = false;
  inputEl.value   = '';
  try { promptRecognition.start(); } catch (_) {}
}

function stopWakeWord() {
  try { wakeRecognition?.stop(); } catch (_) {}
}

function toggleVoice() {
  if (!promptRecognition) return;
  if (isListening) {
    intentionalStop = true;
    try { promptRecognition?.stop(); } catch (_) {}
  } else {
    stopWakeWord();
    startChatPrompt();
  }
}

function toggleWakeWord() {
  wakeWordActive = !wakeWordActive;
  if (wakeWordActive) { try { wakeRecognition?.start(); } catch (_) {} }
  else stopWakeWord();
  updateWakeUI();
}

function updateWakeUI() {
  if (!wakeBtn) return;
  wakeBtn.classList.toggle('wake-active', wakeWordActive);
  wakeBtn.title = wakeWordActive
    ? 'Wake word ON — say "Jarvis" to activate'
    : 'Wake word OFF — click to enable';
}

if (voiceBtn) voiceBtn.addEventListener('click', toggleVoice);
if (wakeBtn)  wakeBtn.addEventListener('click', toggleWakeWord);

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && document.activeElement !== inputEl && !busy && window.JARVIS.tab === 'chat') {
    e.preventDefault();
    toggleVoice();
  }
});

window.addEventListener('load', () => {
  wakeWordActive = true;
  try { wakeRecognition?.start(); } catch (_) {}
  updateWakeUI();
});

// ══════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ══════════════════════════════════════════════════════════════
function detectLang(text) {
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja-JP';
  if (/[\uAC00-\uD7AF]/.test(text))               return 'ko-KR';
  if (/[\u4E00-\u9FFF]/.test(text))               return 'zh-CN';
  if (/[\u0600-\u06FF]/.test(text))               return 'ar-SA';
  if (/[\u0400-\u04FF]/.test(text))               return 'ru-RU';
  if (/[\u0E00-\u0E7F]/.test(text))               return 'th-TH';
  return 'en-US';
}

// ══════════════════════════════════════════════════════════════
// TTS
// ══════════════════════════════════════════════════════════════
function setSpeaking(val) {
  speaking = val;
  speakBar.classList.toggle('active', val);

  if (window.JARVIS.tab === 'voice') {
    setVoiceState(val ? 'speaking' : 'idle');
    if (!val) window.JARVIS.onSpeakEnd();
  }
}

function cleanForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, 'code block.')
    .replace(/`[^`]+`/g, '')
    .replace(/[*_#>~]/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

async function speakWithKokoro(text) {
  const response = await fetch(`${KOKORO_URL}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'kokoro', input: text, voice: KOKORO_VOICE, response_format: 'mp3', speed: 1.0 })
  });
  if (!response.ok) throw new Error(`Kokoro ${response.status}`);
  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  activeAudio = new Audio(url);
  activeAudio.onplay  = () => setSpeaking(true);
  activeAudio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
  activeAudio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url); };
  activeAudio.play();
}

function speakWithBrowser(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance  = new SpeechSynthesisUtterance(text);
  utterance.lang   = lang; utterance.rate = 1.15; utterance.pitch = 1.1; utterance.volume = 1.0;
  const voices     = window.speechSynthesis.getVoices();
  const langCode   = lang.split('-')[0];
  const preferred  = voices.find(v => v.lang.startsWith(langCode))
                  || voices.find(v => /en/i.test(v.lang)) || voices[0];
  if (preferred) utterance.voice = preferred;
  utterance.onstart = () => setSpeaking(true);
  utterance.onend   = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);
  window.speechSynthesis.speak(utterance);
}

async function speakText(text) {
  stopSpeech();
  const clean = cleanForSpeech(text);
  if (!clean) return;
  if (window.JARVIS.tab === 'voice') showVoiceReply(clean);
  const lang = detectLang(clean);
  if (lang === 'en-US') {
    try { await speakWithKokoro(clean); }
    catch (err) { console.warn('Kokoro fallback:', err.message); speakWithBrowser(clean, lang); }
  } else {
    speakWithBrowser(clean, lang);
  }
}

function stopSpeech() {
  if (activeAudio) { activeAudio.pause(); activeAudio = null; }
  window.speechSynthesis?.cancel();
  setSpeaking(false);
}

speakBar.addEventListener('click', stopSpeech);
if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => {};

window.speakText   = speakText;
window.setSpeaking = setSpeaking;
window.stopSpeech  = stopSpeech;

// voice.js — Voice input (wake word + prompt) & adaptive TTS (Kokoro / browser fallback)

const voiceBtn       = document.getElementById('voice-btn');
const speakBar       = document.getElementById('speaking-bar');
const liveTranscript = document.getElementById('transcript-live');
const wakeBtn        = document.getElementById('wake-btn');

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════
const KOKORO_URL        = 'http://localhost:8880';
const KOKORO_VOICE      = 'am_michael';
const WAKE_WORDS        = ['jarvis', 'hey jarvis', 'ok jarvis', 'yo jarvis'];
const PROMPT_MAX_MS     = 12000; // stop listening after 12s of silence/nothing
const PROMPT_SETTLE_MS  = 900;   // wait after wake word before starting mic (let residual audio clear)
const PROMPT_LINGER_MS  = 1200;  // after a final result, wait this long before stopping (catches trailing words)

// ══════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════
let isListening    = false;
let speaking       = false;
let wakeWordActive = false;
let activeAudio    = null;
let promptTimeout  = null;
let lingerTimeout  = null;

// ══════════════════════════════════════════════════════════════
// WAKE SOUND — two-tone ascending beep
// ══════════════════════════════════════════════════════════════
function playWakeSound() {
  try {
    const ctx   = new (window.AudioContext || window.webkitAudioContext)();
    const tones = [523, 784]; // C5 → G5
    tones.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type            = 'sine';
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.18);
      osc.start(t0);
      osc.stop(t0 + 0.2);
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

  // ── WAKE WORD LISTENER (continuous background) ─────────────
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
        // Delay lets the mic buffer clear before we start listening for the prompt
        setTimeout(startPromptListening, PROMPT_SETTLE_MS);
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

  // ── PROMPT LISTENER ────────────────────────────────────────
  // continuous=true so it doesn't auto-stop on brief pauses.
  // We manually stop it once we have a final result + linger period.
  promptRecognition = new SpeechRecognition();
  promptRecognition.continuous     = true;
  promptRecognition.interimResults = true;
  promptRecognition.lang           = ''; // auto-detect language

  promptRecognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('listening');
    liveTranscript.textContent = '🎙 Listening…';
    liveTranscript.classList.add('active');

    // Hard timeout — stop if user never speaks
    promptTimeout = setTimeout(() => {
      stopPromptListening();
    }, PROMPT_MAX_MS);
  };

  promptRecognition.onresult = (e) => {
    let interim = '';
    let finalText = '';

    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interim += t;
    }

    liveTranscript.textContent = '🎙 ' + (finalText || interim || 'Listening…');

    if (finalText) {
      // Accumulate into input (handles multi-sentence speech)
      inputEl.value = (inputEl.value + ' ' + finalText).trim();

      // Reset the linger timer — stop shortly after the last final result
      clearTimeout(lingerTimeout);
      lingerTimeout = setTimeout(() => {
        stopPromptListening();
      }, PROMPT_LINGER_MS);
    }
  };

  promptRecognition.onend = () => {
    clearTimeout(promptTimeout);
    clearTimeout(lingerTimeout);
    isListening = false;
    voiceBtn.classList.remove('listening');
    liveTranscript.classList.remove('active');

    const text = inputEl.value.trim();
    if (text && !busy) sendMessage(text);

    // Resume wake word
    if (wakeWordActive) {
      setTimeout(() => { try { wakeRecognition.start(); } catch (_) {} }, 600);
    }
  };

  promptRecognition.onerror = (e) => {
    clearTimeout(promptTimeout);
    clearTimeout(lingerTimeout);
    isListening = false;
    voiceBtn.classList.remove('listening');
    liveTranscript.classList.remove('active');

    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      showError('Microphone error: ' + e.error);
    }
    if (wakeWordActive) {
      setTimeout(() => { try { wakeRecognition.start(); } catch (_) {} }, 600);
    }
  };

} else {
  voiceBtn.title         = 'Voice input not supported in this browser (use Edge)';
  voiceBtn.style.opacity = '0.3';
  voiceBtn.disabled      = true;
  if (wakeBtn) { wakeBtn.style.opacity = '0.3'; wakeBtn.disabled = true; }
}

// ══════════════════════════════════════════════════════════════
// CONTROL FUNCTIONS
// ══════════════════════════════════════════════════════════════
function startPromptListening() {
  if (!promptRecognition || busy) return;
  inputEl.value = '';
  try { promptRecognition.start(); } catch (_) {}
}

function stopPromptListening() {
  clearTimeout(promptTimeout);
  clearTimeout(lingerTimeout);
  try { promptRecognition?.stop(); } catch (_) {}
}

function stopWakeWord() {
  try { wakeRecognition?.stop(); } catch (_) {}
}

function toggleVoice() {
  if (!promptRecognition) return;
  if (isListening) {
    stopPromptListening();
  } else {
    stopWakeWord();
    startPromptListening();
  }
}

function toggleWakeWord() {
  wakeWordActive = !wakeWordActive;
  if (wakeWordActive) {
    try { wakeRecognition?.start(); } catch (_) {}
  } else {
    stopWakeWord();
  }
  updateWakeUI();
}

function updateWakeUI() {
  if (!wakeBtn) return;
  wakeBtn.classList.toggle('wake-active', wakeWordActive);
  wakeBtn.title = wakeWordActive
    ? 'Wake word ON — say "Jarvis" to activate'
    : 'Wake word OFF — click to enable';
}

voiceBtn.addEventListener('click', toggleVoice);
if (wakeBtn) wakeBtn.addEventListener('click', toggleWakeWord);

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && document.activeElement !== inputEl && !busy) {
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
// TTS — Kokoro for English, browser TTS for other languages
// ══════════════════════════════════════════════════════════════
function setSpeaking(val) {
  speaking = val;
  speakBar.classList.toggle('active', val);
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
    body: JSON.stringify({
      model: 'kokoro',
      input: text,
      voice: KOKORO_VOICE,
      response_format: 'mp3',
      speed: 1.0
    })
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
  utterance.lang   = lang;
  utterance.rate   = 1.0;
  utterance.pitch  = 1.0;
  utterance.volume = 1.0;
  const voices     = window.speechSynthesis.getVoices();
  const langCode   = lang.split('-')[0];
  const preferred  = voices.find(v => v.lang.startsWith(langCode))
                  || voices.find(v => /en/i.test(v.lang))
                  || voices[0];
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
  const lang = detectLang(clean);
  if (lang === 'en-US') {
    try {
      await speakWithKokoro(clean);
    } catch (err) {
      console.warn('Kokoro unavailable, falling back to browser TTS:', err.message);
      speakWithBrowser(clean, lang);
    }
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

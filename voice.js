// voice.js — Voice input (Web Speech API) & voice output (Speech Synthesis)

const voiceBtn       = document.getElementById('voice-btn');
const speakBar       = document.getElementById('speaking-bar');
const liveTranscript = document.getElementById('transcript-live');
const ttsToggle      = document.getElementById('tts-toggle');

let isListening = false;
let speaking    = false;

// ══════════════════════════════════════════════════════════════
// VOICE INPUT
// ══════════════════════════════════════════════════════════════
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous     = false;
  recognition.interimResults = true;
  recognition.lang           = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('listening');
    liveTranscript.textContent = '🎙 Listening…';
    liveTranscript.classList.add('active');
  };

  recognition.onresult = (e) => {
    let interim = '';
    let final   = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else interim += t;
    }
    liveTranscript.textContent = '🎙 ' + (final || interim || 'Listening…');
    if (final) inputEl.value = final;
  };

  recognition.onend = () => {
    isListening = false;
    voiceBtn.classList.remove('listening');
    liveTranscript.classList.remove('active');
    const text = inputEl.value.trim();
    if (text && !busy) sendMessage(text);
  };

  recognition.onerror = (e) => {
    isListening = false;
    voiceBtn.classList.remove('listening');
    liveTranscript.classList.remove('active');
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      showError('Microphone error: ' + e.error);
    }
  };

} else {
  // Browser doesn't support voice input
  voiceBtn.title    = 'Voice input not supported in this browser (use Chrome/Edge)';
  voiceBtn.style.opacity = '0.3';
  voiceBtn.disabled = true;
}

function toggleVoice() {
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
  } else {
    inputEl.value = '';
    recognition.start();
  }
}

voiceBtn.addEventListener('click', toggleVoice);

// Space bar toggles mic when textarea isn't focused
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && document.activeElement !== inputEl && !busy) {
    e.preventDefault();
    toggleVoice();
  }
});

// ══════════════════════════════════════════════════════════════
// VOICE OUTPUT (TTS)
// ══════════════════════════════════════════════════════════════
function setSpeaking(val) {
  speaking = val;
  speakBar.classList.toggle('active', val);
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  // Strip markdown symbols for cleaner speech
  const clean = text
    .replace(/```[\s\S]*?```/g, 'code block.')
    .replace(/`[^`]+`/g, '')
    .replace(/[*_#>~]/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();

  const utterance   = new SpeechSynthesisUtterance(clean);
  utterance.rate    = 1.0;
  utterance.pitch   = 0.9;
  utterance.volume  = 1.0;

  // Prefer a deep en-US voice for the Jarvis feel
  const voices    = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    /en[-_]US/i.test(v.lang) &&
    /male|daniel|alex|fred|microsoft david|google us/i.test(v.name)
  ) || voices.find(v => /en[-_]US/i.test(v.lang)) || voices[0];
  if (preferred) utterance.voice = preferred;

  utterance.onstart = () => setSpeaking(true);
  utterance.onend   = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);

  window.speechSynthesis.speak(utterance);
}

// Stop speech when clicking the speaking bar
speakBar.addEventListener('click', () => {
  window.speechSynthesis?.cancel();
  setSpeaking(false);
});

// Voices load asynchronously in some browsers
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

// Expose speakText globally so chat.js can call it
window.speakText  = speakText;
window.setSpeaking = setSpeaking;

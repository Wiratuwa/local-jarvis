# Kokoro TTS Setup Guide

Kokoro is a fast, local, high-quality TTS engine.
Your `voice.js` is already wired to use it automatically.
If Kokoro isn't running, it silently falls back to browser TTS.

---

## Install & Run (one-time setup)

### Option A — Docker (easiest, recommended)

```bash
docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:v0.2.2
```

With GPU (much faster):
```bash
docker run --gpus all -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-gpu:v0.2.2
```

### Option B — Python (pip)

```bash
pip install kokoro-onnx soundfile
pip install kokoro-fastapi
kokoro-fastapi
```

---

## Verify it's running

Open in your browser:
```
http://localhost:8880/docs
```

You should see the FastAPI swagger UI.

---

## Available Voices

Visit `http://localhost:8880/voices` when Kokoro is running to see all voices.

**Best voices for a Jarvis feel:**

| Voice ID     | Description              |
|--------------|--------------------------|
| `am_michael` | Deep American male ✅ default |
| `am_adam`    | Clear American male      |
| `am_fenrir`  | Assertive, dramatic male |
| `bm_george`  | British male             |
| `bf_emma`    | British female           |

To change the voice, edit the top of `voice.js`:
```js
const KOKORO_VOICE = 'am_michael';
```

---

## Full stack startup checklist

```bash
# 1. Ollama (AI model)
OLLAMA_ORIGINS=* ollama serve

# 2. Kokoro (natural TTS)
docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:v0.2.2

# 3. Your agent (serve files)
cd your-jarvis-folder
python3 -m http.server 8080
# Open http://localhost:8080
```

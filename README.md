# J.A.R.V.I.S Local Agent

A sleek, Iron Man-inspired AI assistant running in your browser. Features 3D WebGL visuals, voice-to-text, real-time local text-to-speech (Kokoro), and support for both local Ollama models and cloud-based Anthropic Claude models.

---

## Features

- **Dual Interface:** Tab-based Chat mode and hands-free auto-looping Voice mode.
- **Voice STT & TTS:** Wake word detection ("Jarvis"), continuous listening via Web Speech API, and real-time streaming TTS via Kokoro (with native browser fallback).
- **3D Visuals:** Interactive WebGL/Three.js data orb and responsive particle system.
- **Hybrid Brains:** Run 100% locally with Ollama (Llama 3, Mistral, Gemma, Phi) or use the cloud with Anthropic Claude 3.5/3.7.
- **CORS Proxy:** Custom Node.js proxy to securely call Anthropic from the browser without CORS blocks.

---

## Requirements

- **Python** (for the UI HTTP server)
- **Node.js** (for the Anthropic proxy)
- **Ollama** (for local models)
- **Docker** (for Kokoro local TTS)
- **Anthropic API Key** (Optional, only needed if using Claude)

---

## Setup & Boot Sequence

You will need four separate terminal windows to run all services simultaneously.

### 1. Start Ollama
Enable CORS so the browser can fetch local models, then start the server:
$env:OLLAMA_ORIGINS="*"; ollama serv

### 2. Start Kokoro TTS
Boot the local text-to-speech engine via Docker:
docker run --gpus all -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-gpu:v0.2.2

### 3. Start the Anthropic Proxy
Navigate to your project folder and start the Node.js proxy to bypass CORS for Claude:
cd "C:\Stuff\Code\Local JARVIS"
node proxy.js

### 4. Start the Web Server
Host your front-end HTML/CSS/JS files:
cd "C:\Stuff\Code\Local JARVIS"
python -m http.server 8080

### 5. Open in Browser
Navigate to:
http://localhost:8080/index.html

/project-folder
 ├── index.html       # Main UI, DOM structure, and inline Three.js 3D/particle scripts
 ├── style.css        # CSS grid, animations, and typography
 ├── app.js           # Tab switching and 3D state management
 ├── chat.js          # Ollama/Anthropic API logic and TTS sentence-chunking queue
 ├── voice.js         # Web Speech STT, Wake Word logic, and audio playback
 ├── proxy.js         # Node.js CORS proxy server for Anthropic
 └── README.md

# Controls
Enter → Send message
Shift + Enter → New line
Space → Toggle microphone (in Chat tab)
"Jarvis" → Wake word to activate listening (in Chat tab)
Dropdown → Switch between Local (Ollama) and Cloud (Claude) models

# Troubleshooting
API Key Required Error
If using Claude, you must paste your Anthropic API key into the input field that appears next to the model selector.

Ollama not detected / OFFLINE
Ensure terminal 1 is running and the OLLAMA_ORIGINS="*" variable was set before running ollama serve.

Claude responses are failing
Ensure node proxy.js is running on port 3000 in terminal 3.

No Audio / TTS failing
Ensure Docker is running the Kokoro container on port 8880. If Kokoro fails, the app will automatically fall back to the browser's native speechSynthesis.


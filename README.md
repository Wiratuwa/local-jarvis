# Local J.A.R.V.I.S

A powerful, completely local AI agent interface inspired by J.A.R.V.I.S., running entirely on your machine. No cloud, no external APIs, complete privacy.

---

## 🌟 Key Features

- **One-Click Launcher**: Use `LocalJARVIS.exe` to instantly start all background services, the web server, and open the interface.
- **Local AI Chat**: Powered by [Ollama](https://ollama.com/), running models like Llama 3, Mistral, Gemma, or Phi entirely locally.
- **Voice Mode & TTS**: GPU-accelerated Text-to-Speech powered by Kokoro TTS (via Docker).
- **Wake Word Detection**: Say *"Jarvis"* to automatically trigger voice listening.
- **Dynamic 3D UI**: Modern, glowing, animated interface with a dynamic 3D core that reacts to the agent's state (listening, thinking, speaking).
- **Chat History**: Automatically saves your conversations locally in your browser.
- **Antigravity IDE Integration**: The launcher automatically opens the Antigravity IDE alongside the application for seamless development.

---

## 🚀 How to Run

The easiest way to use Local JARVIS is via the bundled Windows launcher.

1. Navigate to the project folder: `C:\Stuff\Code\Local JARVIS`
2. Double-click **`LocalJARVIS.exe`** (or use the desktop shortcut if you've created one).
3. The custom launcher splash screen will appear and sequentially start:
   - Ollama (with CORS enabled)
   - Kokoro TTS (Docker container)
   - The local Python web server
   - Antigravity IDE
   - Microsoft Edge (opening the JARVIS web interface)

*Wait a few seconds for all services to initialize, and the web interface will be ready!*

---

## 🛠️ Prerequisites

If you are setting this up from scratch, ensure you have the following installed:

1. **[Ollama](https://ollama.com/download)** (Make sure you pull a model, e.g., `ollama pull llama3.2`)
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (For running Kokoro TTS. Ensure WSL2 and GPU support are enabled if applicable)
3. **Python 3** (For the lightweight local HTTP server)
4. **.NET 10.0** (Required to run the `LocalJARVIS.exe` launcher)

---

## 🧠 How It Works (Application Rundown)

The project consists of two main parts: the **Launcher** and the **Web App**.

### 1. The Launcher (`LocalJARVIS.exe`)
A C# Windows Forms application that orchestrates the startup sequence.
- Suppresses ugly console windows.
- Spawns independent background processes for Ollama, Docker (Kokoro TTS), and the Python web server.
- Provides a clean UI with a progress bar to track service initialization.

### 2. The Web Application (`index.html`)
A front-end only web application (HTML/CSS/JS) that communicates directly with your local services.
- **Chat (`chat.js`)**: Manages the text interface, sending API requests to `http://localhost:11434/api/chat` (Ollama) and streaming the responses back into the UI.
- **Voice (`voice.js`)**: Uses the browser's Web Speech API for speech-to-text (dictation & wake word), and sends the AI's responses to the local Kokoro TTS Docker container (`http://localhost:8880`) to generate speech audio.
- **History (`history.js`)**: Uses `localStorage` to save, load, and clear past conversations so you don't lose context between sessions.
- **Visuals (`app.js` & Three.js)**: Renders the dynamic 3D icosahedron in the background that reacts to the agent's current state.

---

## 📁 Project Structure

```text
/Local JARVIS
 ├── LocalJARVIS.exe        # The one-click Windows launcher
 ├── index.html             # Main application entry point
 ├── style.css              # UI styling and animations
 ├── app.js                 # Global state and Three.js 3D logic
 ├── chat.js                # LLM communication and text UI
 ├── voice.js               # Wake word, Speech-to-Text, and Kokoro TTS
 ├── history.js             # LocalStorage chat history management
 ├── launcher/              # C# source code for the .exe launcher
 ├── start-jarvis.ps1       # Alternative PowerShell startup script
 └── create-shortcut.ps1    # Script to create a Desktop shortcut
```

---

## ⚙️ Manual Startup (Alternative)

If you prefer not to use the `.exe`, you can start the services manually:

1. **Start Ollama** (with CORS enabled):
   ```powershell
   $env:OLLAMA_ORIGINS="*"; ollama serve
   ```
2. **Start Kokoro TTS**:
   ```powershell
   docker run --gpus all -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-gpu:v0.2.2
   ```
3. **Start Web Server**:
   ```powershell
   python -m http.server 8080
   ```
4. **Open Browser**: `http://localhost:8080`

---

## 🛑 Troubleshooting

- **Ollama not connecting?** Ensure Ollama is running and the CORS variable (`OLLAMA_ORIGINS="*"`) is set before launching it.
- **Voice TTS failing?** Ensure Docker Desktop is running and the Kokoro container downloaded successfully.
- **Wake Word not working?** Ensure you have granted microphone permissions in your browser (Microsoft Edge/Chrome).
- **Launcher crashes?** Ensure you have the .NET 10 Desktop Runtime installed on your Windows machine.

---

## 🔒 Privacy Note
Everything runs locally. No chat data, voice recordings, or personal information ever leaves your machine. No API keys are required.

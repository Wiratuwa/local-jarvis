# Local AI Chat (Ollama UI)

A minimal, browser-based chat interface for running AI models locally using Ollama.

No backend required.  
Runs fully on your machine.

---

## Features

- Local AI chat (no external API)
- Streaming responses
- Model switcher (llama, mistral, gemma, phi, etc.)
- Auto-detect Ollama status
- Clean, responsive UI
- Error handling for connection issues

---

## Requirements

- Python (for simple HTTP server)
- Ollama installed and running

Install Ollama:
https://ollama.com/download

---

## Setup

### 1. Start Ollama
```
ollama serve
```

Optional (fix CORS issues):
```
OLLAMA_ORIGINS=* ollama serve
```

---

### 2. Pull a model
Example:
```
ollama pull llama3.2
```

You can also use:
- llama3
- mistral
- gemma3
- phi3

---

### 3. Run local server

Inside your project folder:
```
python -m http.server 8080
```

---

### 4. Open in browser

http://localhost:8080/ai_agent_test.html

---

## How It Works

- Frontend sends requests to:
```
http://localhost:11434/api/chat
```

- Uses streaming responses from Ollama
- Maintains chat history in memory
- Dynamically updates UI as tokens arrive

---

## Project Structure

```
/project-folder
 ├── ai_agent_test.html
 └── README.md
```

---

## Controls

- Enter → send message  
- Shift + Enter → new line  
- Dropdown → switch model  

---

## Troubleshooting

### Ollama not detected
Make sure:
```
ollama serve
```
is running

---

### CORS error / fetch failed
Run:
```
OLLAMA_ORIGINS=* ollama serve
```

---

### Model not showing
Pull it manually:
```
ollama pull <model-name>
```

---

### 404 errors in terminal

Example:
```
GET /favicon.ico 404
GET /ollama-chat.html 404
```

Not critical.  
Only means those files don’t exist.

---

## Notes

- Everything runs locally
- No data leaves your machine
- No API keys needed

---

## Next Improvements (optional)

- Save chat history (localStorage)
- Markdown rendering
- Code highlighting
- File upload support
- Multi-chat sessions

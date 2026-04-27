# ============================================================
#  Local JARVIS — One-Click Launcher
#  Run this script from any terminal:
#    .\start-jarvis.ps1
# ============================================================

$projectDir = "C:\Stuff\Code\Local JARVIS"
$antigravity = "C:\Users\Aloy\AppData\Local\Programs\Antigravity\Antigravity.exe"

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "    Starting Local JARVIS Services...     " -ForegroundColor Cyan
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Ollama (LLM server with CORS enabled) ---
Write-Host "  [1/5] Starting Ollama server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'JARVIS - Ollama'; `$env:OLLAMA_ORIGINS='*'; ollama serve"

# --- 2. Kokoro TTS (Docker, GPU-accelerated) ---
Write-Host "  [2/5] Starting Kokoro TTS (Docker)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'JARVIS - Kokoro TTS'; docker run --gpus all -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-gpu:v0.2.2"

# --- 3. Web Server (Python Flask Bridge on port 8080) ---
Write-Host "  [3/5] Starting bridge server on http://localhost:8080 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'JARVIS - Bridge Server'; Set-Location '$projectDir'; python execution/bridge_server.py"

# --- 4. Open Antigravity IDE ---
Write-Host "  [4/5] Opening Antigravity IDE..." -ForegroundColor Yellow
Start-Process $antigravity -ArgumentList $projectDir

# --- 5. Open in Browser (Edge) ---
Write-Host "  [5/5] Opening in Microsoft Edge..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "msedge" "http://localhost:8080/index.html"

Write-Host ""
Write-Host "  All services launched!" -ForegroundColor Green
Write-Host ""
Write-Host "  Running:" -ForegroundColor DarkGray
Write-Host "    - JARVIS - Ollama" -ForegroundColor DarkGray
Write-Host "    - JARVIS - Kokoro TTS" -ForegroundColor DarkGray
Write-Host "    - JARVIS - Web Server" -ForegroundColor DarkGray
Write-Host "    - Antigravity IDE" -ForegroundColor DarkGray
Write-Host "    - Microsoft Edge" -ForegroundColor DarkGray
Write-Host ""

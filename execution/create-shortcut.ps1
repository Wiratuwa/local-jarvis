# ============================================================
#  Creates a "Local JARVIS" shortcut on your Desktop
#  with the custom JARVIS icon.
#
#  Run once:  .\create-shortcut.ps1
# ============================================================

$desktopPath  = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Local JARVIS.lnk"
$scriptPath   = "C:\Stuff\Code\Local JARVIS\execution\start-jarvis.ps1"
$iconPath     = "C:\Stuff\Code\Local JARVIS\assets\jarvis.ico"
$workingDir   = "C:\Stuff\Code\Local JARVIS"

$shell    = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)

# Launch PowerShell hidden, then run the launcher script
$shortcut.TargetPath       = "powershell.exe"
$shortcut.Arguments        = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
$shortcut.WorkingDirectory = $workingDir
$shortcut.IconLocation     = "$iconPath, 0"
$shortcut.Description      = "Launch all Local JARVIS services"
$shortcut.Save()

Write-Host ""
Write-Host "  Desktop shortcut created!" -ForegroundColor Green
Write-Host "  Location: $shortcutPath" -ForegroundColor DarkGray
Write-Host ""

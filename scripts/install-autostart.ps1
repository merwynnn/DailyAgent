# ===========================================================================
#  install-autostart.ps1
#
#  Puts a shortcut in your Windows Startup folder so the DailyAgent runs at
#  every logon. The runner itself waits for 06:00 and refuses to run twice in
#  one day, so the shortcut is safe to leave installed.
#
#  Run it from PowerShell:
#      powershell -ExecutionPolicy Bypass -File .\scripts\install-autostart.ps1
#
#  No administrator rights are needed: the Startup folder is per-user.
# ===========================================================================

$ErrorActionPreference = 'Stop'

$scriptsDir = $PSScriptRoot
$repoDir    = Split-Path -Parent $scriptsDir
$vbs        = Join-Path $scriptsDir 'run-daily.vbs'
$wscript    = Join-Path $env:SystemRoot 'System32\wscript.exe'

if (-not (Test-Path -LiteralPath $vbs)) {
    throw "Missing launcher: $vbs"
}

if (-not (Test-Path -LiteralPath $wscript)) {
    throw "Cannot find wscript.exe at $wscript"
}

# --- sanity check: the WSL distribution the runner targets -------------------
$distro = 'Ubuntu'
try {
    $distros = (& wsl.exe -l -q 2>$null) -replace "`0", '' | Where-Object { $_.Trim() -ne '' }
    if ($distros -notcontains $distro) {
        Write-Warning "WSL distribution '$distro' was not found. Installed: $($distros -join ', ')"
        Write-Warning "Edit scripts\run-daily.cmd and replace 'Ubuntu' with the right name."
    }
} catch {
    Write-Warning "Could not query WSL. The shortcut will still be installed."
}

# --- create the shortcut ----------------------------------------------------
$startup = [Environment]::GetFolderPath('Startup')
$link    = Join-Path $startup 'DailyAgent.lnk'

$shell    = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($link)
$shortcut.TargetPath       = $wscript
$shortcut.Arguments        = '"' + $vbs + '"'
$shortcut.WorkingDirectory = $scriptsDir
$shortcut.WindowStyle      = 7          # minimised; the launcher hides it anyway
$shortcut.Description      = 'DailyAgent - one autonomous run per day, after 06:00'
$shortcut.Save()

Write-Host ''
Write-Host '  DailyAgent autostart installed.' -ForegroundColor Green
Write-Host ''
Write-Host "  Shortcut : $link"
Write-Host "  Launcher : $vbs"
Write-Host "  Project  : $repoDir"
Write-Host ''
Write-Host '  What happens now:'
Write-Host '    - at every logon the runner starts, waits for 06:00 if it is earlier,'
Write-Host '      and runs once. A second logon on the same day does nothing.'
Write-Host ''
Write-Host '  Try it now without waiting for a logon:'
Write-Host "    $scriptsDir\run-daily.cmd --dry-run"
Write-Host ''
Write-Host '  Remove it again with:'
Write-Host "    powershell -ExecutionPolicy Bypass -File `"$scriptsDir\uninstall-autostart.ps1`""
Write-Host ''

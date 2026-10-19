# ===========================================================================
#  install-autostart.ps1
#
#  Sets up two independent triggers, so a run happens whether the machine is
#  freshly booted or has been sitting on all week:
#
#    1. A user-level Scheduled Task, triggered daily at 06:05 and again at
#       logon. "Run task as soon as possible after a scheduled start is
#       missed" catches up after a shutdown, suspend or a closed lid.
#    2. A shortcut in the Startup folder, as a belt-and-braces fallback for
#       machines where task registration is blocked by policy.
#
#  Both of them run the same launcher, and the launcher is idempotent: it takes
#  a lock and refuses to start twice on the same day, so a double trigger is
#  harmless.
#
#  No administrator rights are needed: the task belongs to the current user and
#  only runs while that user is logged on.
#
#  Run it from PowerShell:
#      powershell -ExecutionPolicy Bypass -File .\scripts\install-autostart.ps1
# ===========================================================================

$ErrorActionPreference = 'Stop'

$scriptsDir = $PSScriptRoot
$repoDir    = Split-Path -Parent $scriptsDir
$vbs        = Join-Path $scriptsDir 'run-daily.vbs'
$wscript    = Join-Path $env:SystemRoot 'System32\wscript.exe'
$taskName   = 'DailyAgent'
$startTime  = '06:05'

if (-not (Test-Path -LiteralPath $vbs))     { throw "Missing launcher: $vbs" }
if (-not (Test-Path -LiteralPath $wscript)) { throw "Cannot find wscript.exe at $wscript" }

# --- sanity check: the WSL distribution the runner targets -------------------
$distro = 'Ubuntu'
try {
    $distros = (& wsl.exe -l -q 2>$null) -replace "`0", '' | Where-Object { $_.Trim() -ne '' }
    if ($distros -notcontains $distro) {
        Write-Warning "WSL distribution '$distro' was not found. Installed: $($distros -join ', ')"
        Write-Warning "Edit scripts\run-daily.cmd and replace 'Ubuntu' with the right name."
    }
} catch {
    Write-Warning 'Could not query WSL. Windows-side setup will continue.'
}

# ===========================================================================
#  1. Scheduled task
# ===========================================================================

$taskState = 'not installed'
try {
    $action = New-ScheduledTaskAction -Execute $wscript -Argument ('"' + $vbs + '"') -WorkingDirectory $scriptsDir

    # Daily at 06:05. The runner itself refuses to start before 06:00, so the
    # five minutes are slack, not a rule.
    $triggerDaily = New-ScheduledTaskTrigger -Daily -At $startTime

    # And once per logon. If that logon is before 06:00 the runner waits.
    $triggerLogon = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
    $triggerLogon.Delay = 'PT2M'

    # StartWhenAvailable is the important one: it turns "I was asleep at 06:05"
    # into "run shortly after I wake up" rather than "skip the day".
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -MultipleInstances IgnoreNew `
        -ExecutionTimeLimit ([TimeSpan]::Zero)

    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

    Register-ScheduledTask `
        -TaskName $taskName `
        -Description 'DailyAgent - one autonomous run per day, after 06:00' `
        -Action $action `
        -Trigger @($triggerDaily, $triggerLogon) `
        -Settings $settings `
        -Principal $principal `
        -Force | Out-Null

    $taskState = "installed (daily at $startTime, at logon, catch-up enabled)"
} catch {
    $taskState = "FAILED: $($_.Exception.Message)"
    Write-Warning "Could not register the scheduled task. The Startup shortcut below still works."
}

# ===========================================================================
#  2. Startup folder shortcut (fallback)
# ===========================================================================

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

# ===========================================================================

Write-Host ''
Write-Host '  DailyAgent autostart installed.' -ForegroundColor Green
Write-Host ''
Write-Host "  Scheduled task : $taskState"
Write-Host "  Startup link   : $link"
Write-Host "  Launcher       : $vbs"
Write-Host "  Project        : $repoDir"
Write-Host ''
Write-Host '  What happens now:'
Write-Host '    - shortly after 06:00, once a day, it runs. If the machine was off or'
Write-Host '      asleep at that moment, it runs shortly after it next wakes up.'
Write-Host '    - logging in also triggers it, which covers the "it is already past'
Write-Host '      six and I just turned the laptop on" case.'
Write-Host '    - either way, it never runs twice in one day.'
Write-Host ''
Write-Host '  Check or trigger it by hand:'
Write-Host "    schtasks /query /tn $taskName /v /fo list"
Write-Host "    schtasks /run   /tn $taskName"
Write-Host "    $scriptsDir\run-daily.cmd --force"
Write-Host ''
Write-Host '  Remove it again with:'
Write-Host "    powershell -ExecutionPolicy Bypass -File `"$scriptsDir\uninstall-autostart.ps1`""
Write-Host ''

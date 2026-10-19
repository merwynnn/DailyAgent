# ===========================================================================
#  uninstall-autostart.ps1
#
#  Removes both triggers installed by install-autostart.ps1: the scheduled task
#  and the Startup-folder shortcut. It deletes nothing else — reports, logs and
#  the repository are untouched.
# ===========================================================================

$ErrorActionPreference = 'Stop'

$taskName = 'DailyAgent'

# --- scheduled task ---------------------------------------------------------
$taskFound = $false
try {
    $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        $taskFound = $true
    }
} catch {
    Write-Warning "Could not remove the scheduled task: $($_.Exception.Message)"
}

# --- startup shortcut -------------------------------------------------------
$startup = [Environment]::GetFolderPath('Startup')
$link    = Join-Path $startup 'DailyAgent.lnk'
$linkFound = $false

if (Test-Path -LiteralPath $link) {
    Remove-Item -LiteralPath $link -Force
    $linkFound = $true
}

# ---------------------------------------------------------------------------

Write-Host ''
if ($taskFound -or $linkFound) {
    Write-Host '  DailyAgent autostart removed.' -ForegroundColor Green
    if ($taskFound) { Write-Host "  Deleted task    : $taskName" }
    if ($linkFound) { Write-Host "  Deleted shortcut: $link" }
} else {
    Write-Host '  Nothing to do: DailyAgent autostart is not installed.'
}
Write-Host ''
Write-Host '  Reports, logs and the repository were left alone.'
Write-Host ''

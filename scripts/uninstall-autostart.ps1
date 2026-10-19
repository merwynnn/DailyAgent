# ===========================================================================
#  uninstall-autostart.ps1
#
#  Removes the DailyAgent shortcut from your Windows Startup folder. It does
#  not delete anything else: logs, reports and the repository are untouched.
# ===========================================================================

$ErrorActionPreference = 'Stop'

$startup = [Environment]::GetFolderPath('Startup')
$link    = Join-Path $startup 'DailyAgent.lnk'

if (Test-Path -LiteralPath $link) {
    Remove-Item -LiteralPath $link -Force
    Write-Host ''
    Write-Host '  DailyAgent autostart removed.' -ForegroundColor Green
    Write-Host "  Deleted: $link"
    Write-Host ''
} else {
    Write-Host ''
    Write-Host '  Nothing to do: the DailyAgent shortcut is not installed.'
    Write-Host "  Looked for: $link"
    Write-Host ''
}

@echo off
rem ===========================================================================
rem  DailyAgent - Windows entry point
rem
rem  Runs the Linux-side runner (scripts/run-daily.sh) inside WSL.
rem
rem  Double-click it, or from a terminal:
rem      run-daily.cmd              run now, if it has not already run today
rem      run-daily.cmd --force      run right now, regardless
rem      run-daily.cmd --dry-run    show what would happen
rem
rem  The Startup shortcut calls this with --autostart, which waits for 06:00
rem  instead of skipping the day.
rem ===========================================================================

setlocal EnableExtensions

set "INTERACTIVE=1"
if /I "%~1"=="--autostart" set "INTERACTIVE=0"

rem Resolve this folder's parent as a WSL path, so moving the project works.
set "WSLDIR="
for /f "usebackq delims=" %%I in (`wsl.exe -d Ubuntu -- wslpath -a "%~dp0.." 2^>nul`) do set "WSLDIR=%%I"

if not defined WSLDIR (
  echo.
  echo   Could not reach WSL. Is the "Ubuntu" distribution installed and running?
  echo   Check with:  wsl.exe -l -v
  echo.
  if "%INTERACTIVE%"=="1" pause
  exit /b 1
)

wsl.exe -d Ubuntu -- bash -c "cd '%WSLDIR%' && ./scripts/run-daily.sh %*"
set "CODE=%ERRORLEVEL%"

if "%INTERACTIVE%"=="1" (
  echo.
  if "%CODE%"=="0" (
    echo   Done. Daily log: %WSLDIR%/logs
  ) else (
    echo   run-daily.sh exited with code %CODE%.
  )
  pause
)

exit /b %CODE%

' ===========================================================================
'  DailyAgent - silent launcher
'
'  Runs run-daily.cmd with --autostart without flashing a console window.
'  The Startup shortcut created by install-autostart.ps1 points at this file.
' ===========================================================================
Option Explicit

Dim fso, shell, here, cmd

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

here = fso.GetParentFolderName(WScript.ScriptFullName)
cmd = here & "\run-daily.cmd"

If Not fso.FileExists(cmd) Then
  ' Nothing to run; fail silently rather than showing an error at logon.
  WScript.Quit 1
End If

' 0 = hidden window, False = do not wait for it to finish.
shell.Run """" & cmd & """ --autostart", 0, False

WScript.Quit 0

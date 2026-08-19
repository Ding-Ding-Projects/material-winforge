@echo off
setlocal
set "MWF_SILENT_ARG="
if /I "%~1"=="/s" set "MWF_SILENT_ARG=-Silent"
if /I "%~1"=="--silent" set "MWF_SILENT_ARG=-Silent"
if "%SILENT%"=="1" set "MWF_SILENT_ARG=-Silent"
call "%~dp0build.bat" /s
set "MWF_EXIT=%ERRORLEVEL%"
if not "%MWF_EXIT%"=="0" exit /b %MWF_EXIT%
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-build.ps1" -Mode Installer %MWF_SILENT_ARG%
set "MWF_EXIT=%ERRORLEVEL%"
exit /b %MWF_EXIT%

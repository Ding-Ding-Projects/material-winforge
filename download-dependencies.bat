@echo off
setlocal
set "MWF_SILENT_ARG="
if /I "%~1"=="/s" set "MWF_SILENT_ARG=-Silent"
if /I "%~1"=="--silent" set "MWF_SILENT_ARG=-Silent"
if "%SILENT%"=="1" set "MWF_SILENT_ARG=-Silent"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\download-dependencies.ps1" %MWF_SILENT_ARG%
set "MWF_EXIT=%ERRORLEVEL%"
exit /b %MWF_EXIT%

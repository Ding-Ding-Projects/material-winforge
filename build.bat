@echo off
setlocal
set "MWF_SILENT_ARG="
if /I "%~1"=="/s" set "MWF_SILENT_ARG=-Silent"
if /I "%~1"=="--silent" set "MWF_SILENT_ARG=-Silent"
if "%SILENT%"=="1" set "MWF_SILENT_ARG=-Silent"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-build.ps1" -Mode App %MWF_SILENT_ARG%
set "MWF_EXIT=%ERRORLEVEL%"
if not "%MWF_EXIT%"=="0" exit /b %MWF_EXIT%
if defined MWF_SILENT_ARG exit /b 0
set "MWF_RUN_CHOICE="
set /p "MWF_RUN_CHOICE=Build completed. Run WinForge Material 3 Preview now? [y/N] "
if /I "%MWF_RUN_CHOICE%"=="Y" start "" "%~dp0main-app-design\dist\win-unpacked\WinForge Material 3 Preview.exe"
exit /b 0

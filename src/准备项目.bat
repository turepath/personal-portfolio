@echo off
rem Run this file from Anaconda Prompt. Keep these settings in that terminal.
rem Conda writes UTF-8 activation data. Read it with the same code page.
chcp 65001 >nul
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"
set "CONDA_ENV_PROMPT=({name}) "
cd /d "%~dp0"
if errorlevel 1 exit /b 1

if not exist "%CD%\.cache\tmp" mkdir "%CD%\.cache\tmp"
if errorlevel 1 exit /b 1
set "TEMP=%CD%\.cache\tmp"
set "TMP=%CD%\.cache\tmp"
set "TMPDIR=%CD%\.cache\tmp"
set "CONDA_ENVS_PATH=%CD%\.conda-envs"
set "CONDA_PKGS_DIRS=%CD%\.cache\conda-pkgs"
set "PIP_CACHE_DIR=%CD%\.cache\pip"
set "MPLCONFIGDIR=%CD%\.cache\matplotlib"
set "PYTHONNOUSERSITE=1"

echo.
echo Project folder: "%CD%"
echo Environment name: hand-gesture
echo Project setup is ready.
echo.

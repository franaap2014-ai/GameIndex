@echo off
setlocal
cd /d "%~dp0"
cls
echo ============================================================
echo  GAMEINDEX BETA 0.986 - PRODUCTION CONSOLIDATION
echo ============================================================
echo.
echo Runtime: LOCAL_FIRST_NO_API_KEY
echo Dexter: Ollama gemma3:4b opcional
echo Image Manager: 2.0
echo Universe Builder: 3.0
echo Music Manager: 2.0
echo Health: http://localhost:3000/health
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js 22.13 ou superior nao foi encontrado.
  pause
  exit /b 1
)
if not exist node_modules\express (
  echo Instalando dependencias do projeto...
  call npm.cmd install
  if errorlevel 1 (
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)
echo Iniciando GameIndex em http://localhost:3000 ...
call npm.cmd start
pause

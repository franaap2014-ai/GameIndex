@echo off
cd /d "%~dp0"
node scripts\apply-hotfix-cleanup-0985-hf3.mjs
if errorlevel 1 exit /b %errorlevel%
echo GameIndex 0.985 HF3 cleanup applied. Deploy the updated files normally.

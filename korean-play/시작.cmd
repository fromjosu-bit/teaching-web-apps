@echo off
cd /d "%~dp0"
echo http://127.0.0.1:4173
echo Close this window or press Ctrl+C to stop.
node server.cjs
pause

@echo off
set TEMP=D:\BookSwap\tmp
set TMP=D:\BookSwap\tmp
set npm_config_cache=D:\BookSwap\tmp\npm-cache
if not exist "D:\BookSwap\tmp" mkdir "D:\BookSwap\tmp"
cd /d D:\BookSwap\frontend
npm run dev
pause

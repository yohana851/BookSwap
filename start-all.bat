@echo off
cd /d D:\BookSwap
echo Starting BookSwap backend and frontend...
start "BookSwap Backend" cmd /k "call venv\Scripts\activate.bat && python run.py"
timeout /t 3 /nobreak >nul
start "BookSwap Frontend" cmd /k "cd /d D:\BookSwap\frontend && npm run dev"
echo.
echo Both servers are starting in separate windows.
echo Backend: http://127.0.0.1:5000
echo Frontend: http://localhost:5173
echo.
echo Keep both windows open while using the app.

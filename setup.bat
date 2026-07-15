@echo off
cd /d D:\BookSwap
call venv\Scripts\activate.bat
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Creating database tables...
flask --app run.py db upgrade
echo.
echo Seeding demo data...
python seed.py
echo.
echo Setup complete. Run start-backend.bat and start-frontend.bat to launch the app.
pause

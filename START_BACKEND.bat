@echo off
echo ================================================================================
echo STARTING BIBLE SERMON ASSISTANT BACKEND
echo ================================================================================
echo.
echo [INFO] Starting FastAPI backend server...
echo [INFO] Backend will run on: http://localhost:8000
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ================================================================================
echo.

cd backend
python app/main.py

pause

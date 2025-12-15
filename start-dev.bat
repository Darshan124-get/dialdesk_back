@echo off
echo Starting DialDesk Admin Panel Frontend...
echo.
echo Make sure the backend is running on http://localhost:4000
echo.
echo Opening in browser...
echo.

REM Try to use Python's HTTP server
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python HTTP server on port 8000...
    start http://localhost:8000
    python -m http.server 8000
) else (
    echo Python not found. Trying Node.js http-server...
    npx --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Using Node.js http-server on port 8000...
        start http://localhost:8000
        npx http-server -p 8000 -c-1
    ) else (
        echo Neither Python nor Node.js http-server found.
        echo Please install Python or run: npm install -g http-server
        echo.
        echo Or manually open index.html in your browser.
        pause
    )
)


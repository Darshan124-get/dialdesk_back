#!/bin/bash

echo "Starting DialDesk Admin Panel Frontend..."
echo ""
echo "Make sure the backend is running on http://localhost:4000"
echo ""

# Try Python first
if command -v python3 &> /dev/null; then
    echo "Using Python HTTP server on port 8000..."
    open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null || start http://localhost:8000 2>/dev/null
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Using Python HTTP server on port 8000..."
    open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null || start http://localhost:8000 2>/dev/null
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "Using Node.js http-server on port 8000..."
    open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null || start http://localhost:8000 2>/dev/null
    npx http-server -p 8000 -c-1
else
    echo "Neither Python nor Node.js http-server found."
    echo "Please install Python or run: npm install -g http-server"
    echo ""
    echo "Or manually open index.html in your browser."
fi


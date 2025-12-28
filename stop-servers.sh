#!/bin/bash

echo "🛑 Stopping SaveKaro servers..."

# Stop backend (port 8000)
BACKEND_PID=$(lsof -ti:8000)
if [ ! -z "$BACKEND_PID" ]; then
    echo "   Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    echo "   ✅ Backend stopped"
else
    echo "   ℹ️  Backend not running"
fi

# Stop frontend (port 3000)
FRONTEND_PID=$(lsof -ti:3000)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "   Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
    echo "   ✅ Frontend stopped"
else
    echo "   ℹ️  Frontend not running"
fi

echo ""
echo "✨ All servers stopped!"

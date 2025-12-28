#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     SaveKaro - Fashion Deal Aggregator                   ║"
echo "║     Quick Start Guide                                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Choose how to run the project:"
echo ""
echo "1️⃣  Run both servers together (Recommended)"
echo "   → npm start"
echo ""
echo "2️⃣  Run using shell scripts"
echo "   → ./start-backend.sh  (Terminal 1)"
echo "   → ./start-frontend.sh (Terminal 2)"
echo ""
echo "3️⃣  Run manually"
echo "   → cd backend && python3 main.py  (Terminal 1)"
echo "   → cd frontend && npm start       (Terminal 2)"
echo ""
echo "4️⃣  Run backend only"
echo "   → npm run backend"
echo ""
echo "5️⃣  Run frontend only"
echo "   → npm run frontend"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "Backend will run on:  http://localhost:8000"
echo "Frontend will run on: http://localhost:3000"
echo "API Docs:            http://localhost:8000/docs"
echo "════════════════════════════════════════════════════════════"
echo ""

read -p "Would you like to start both servers now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🚀 Starting SaveKaro..."
    npm start
fi

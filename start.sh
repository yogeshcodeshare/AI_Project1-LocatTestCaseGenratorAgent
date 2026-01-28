#!/bin/bash

# Kill background processes on exit
trap "kill 0" EXIT

echo "🚀 Starting Local LLM Test Case Generator..."

# 1. Start Backend
echo "📡 Starting Backend (FastAPI) on port 8000..."
./venv/bin/python3 -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 &

# 2. Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
sleep 3

# 3. Start Frontend
echo "🎨 Starting Frontend on port 8080..."
cd frontend && python3 -m http.server 8080 &

echo "✨ System is live!"
echo "👉 http://localhost:8080"

# Keep script running
wait

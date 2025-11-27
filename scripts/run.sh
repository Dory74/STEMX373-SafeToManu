#!/usr/bin/env bash

# Fail fast if something breaks
set -e

# Move to project root (directory containing this script)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

echo "=== Starting backend (FastAPI + Uvicorn) on port 8230 ==="
(
  cd backend
  source ../.venv/bin/activate 2>/dev/null || true
  uvicorn app.main:app --reload --port 8230 &
  BACKEND_PID=$!
)

echo "=== Starting frontend (Vite dev server) on port 5173 ==="
(
  cd frontend
  npm install --silent
  npm run dev &
  FRONTEND_PID=$!
)

echo ""
echo "=== Dev environment running ==="
echo "Backend:  http://localhost:8001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press CTRL+C to stop both."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Wait so script doesn’t exit immediately
wait

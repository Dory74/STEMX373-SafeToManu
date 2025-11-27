#!/usr/bin/env bash
set -e
source .env


# Resolve important absolute paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$ROOT_DIR/venv"

echo "ROOT_DIR=$ROOT_DIR"
echo "Using virtualenv at: $VENV_DIR"

echo "=== Starting backend (FastAPI + Uvicorn) on port $BACKEND_PORT ==="
{
  cd "$BACKEND_DIR"
  source "$VENV_DIR/bin/activate" 2>/dev/null || echo "WARNING: Could not activate venv"
  uvicorn app.main:app --reload --host ${IP_ADDRESS} --port ${BACKEND_PORT} &
  BACKEND_PID=$!
}

echo "=== Starting frontend (Vite dev server) on port $FRONTEND_PORT ==="
{
  cd "$FRONTEND_DIR"
  npm install --silent
  npm run dev &
  FRONTEND_PID=$!
}

echo ""
echo "=== Dev environment running ==="
echo "Backend:  http://localhost:${BACKEND_PORT}  (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:${FRONTEND_PORT} (PID: $FRONTEND_PID)"
echo ""
echo "Press CTRL+C to stop both."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait

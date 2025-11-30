#!/usr/bin/env bash
set -euo pipefail

# Load env (for BACKEND_PORT/IP) if present
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_DIR="$ROOT_DIR/venv"
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi
PORT="${BACKEND_PORT:-8230}"

echo "Starting backend on port ${PORT}..."
cd "$BACKEND_DIR"

# Ensure the backend package is importable
export PYTHONPATH="$BACKEND_DIR:${PYTHONPATH:-}"

# Activate virtualenv if it exists
if [ -d "$VENV_DIR/bin" ]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
fi

uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --log-level warning &
SERVER_PID=$!

cleanup() {
  echo "Stopping backend (PID: $SERVER_PID)..."
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

pytest -q

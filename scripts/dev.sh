#!/bin/bash

# Run from the root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"
cd "../"

pnpm dev --host &
PNPM_DEV_PID=$!

cd "$SCRIPT_DIR"
cd "../db"

./pocketbase superuser upsert admin@admin.com password123 &

./pocketbase serve --http="0.0.0.0:8090" &
POCKETBASE_PID=$!

cleanup() {
  kill -TERM $PNPM_DEV_PID
  kill -TERM $POCKETBASE_PID
}

trap cleanup EXIT

wait $PNPM_DEV_PID $POCKETBASE_PID

exit 0
#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

go build -o pocketbase

chmod +x pocketbase

./pocketbase superuser upsert admin@admin.com password123 &
./pocketbase serve --http="0.0.0.0:8090"

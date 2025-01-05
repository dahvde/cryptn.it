#!/bin/bash

set -e

echo "Creating superuser..."
./pocketbase superuser upsert admin@admin.com password123

echo "Starting PocketBase..."
exec ./pocketbase serve --http=0.0.0.0:8090

#!/bin/bash

# Start the first process
export PORT=3030
node /app/build/index.js &

# Start the second process
/var/lib/pocketbase/run serve --http 0.0.0.0:8090 &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
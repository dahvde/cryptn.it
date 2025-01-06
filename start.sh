#!/bin/bash

# Start the first process
node /app/build/index.js &

# Start the second process
/app/db/pocketbase serve &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
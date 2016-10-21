
#!/bin/bash

# Exit on first error, print all commands.
set -ev

# Wait for the Hyperledger Fabric to start.
while ! nc -q 1 vp0 5000 </dev/null; do sleep 1; done
while ! nc -q 1 membersrvc 50051 </dev/null; do sleep 1; done

# Start Mozart.
node app.js

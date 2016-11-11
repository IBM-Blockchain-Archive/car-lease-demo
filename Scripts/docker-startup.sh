
#!/bin/bash

# Exit on first error, print all commands.
set -ev

# Wait for the Hyperledger Fabric to start.
while ! nc -q 1 fabric-ca 7054 </dev/null; do sleep 1; done
while ! nc -q 1 vp0 7050 </dev/null; do sleep 1; done

# Start Car Lease Demo.
node app.js

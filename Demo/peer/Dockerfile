FROM hyperledger/fabric-peer:latest
# Install required prereqs.
RUN apt-get -y update && apt-get -y install net-tools netcat nmap
COPY core.yaml ./peer/core.yaml

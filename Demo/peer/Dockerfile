FROM yeasy/hyperledger:0.5-dp
# Install required prereqs.
RUN apt-get -y update && apt-get -y install net-tools netcat nmap
COPY core.yaml ./peer/core.yaml
COPY vehicle_code/vehicles.go ./vehicle_code/vehicles.go
RUN go build ./vehicle_code/vehicles.go

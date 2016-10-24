#!/bin/bash

rm -r /tmp/keyValStore;
rm -r /tmp/chaincode;
docker-compose kill;
docker-compose down;
docker rm $(docker ps -aq);
docker-compose up -d;

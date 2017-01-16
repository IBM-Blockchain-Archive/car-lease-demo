 
@echo off
set DIR=%~dp0..
cd %DIR%
:: If the keyValStore exits, remove it
IF EXIST keyValStore  (
rmdir /s /q keyValStore
)
  
 ::Tag the latest version of fabric-baseimage
docker pull hyperledger/fabric-baseimage:x86_64-0.1.0
docker tag hyperledger/fabric-baseimage:x86_64-0.1.0  hyperledger/fabric-baseimage:latest

:: Clean up old docker containers
docker-compose -f %cd%\docker-compose.yml kill
docker-compose -f %cd%\docker-compose.yml down
docker-compose -f %cd%\docker-compose.yml build
docker-compose -f %cd%\docker-compose.yml up 
 
PAUSE 
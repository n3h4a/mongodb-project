@echo off
REM Scenario A4 - start the three members of replica set rs0 on Windows.
REM Each mongod opens in its own terminal window. Keep all three windows open.

mkdir C:\data\rs0-1 2>nul
mkdir C:\data\rs0-2 2>nul
mkdir C:\data\rs0-3 2>nul

start "rs0 - 27017" mongod --replSet rs0 --port 27017 --dbpath C:\data\rs0-1 --bind_ip localhost
start "rs0 - 27018" mongod --replSet rs0 --port 27018 --dbpath C:\data\rs0-2 --bind_ip localhost
start "rs0 - 27019" mongod --replSet rs0 --port 27019 --dbpath C:\data\rs0-3 --bind_ip localhost

#!/usr/bin/env bash
# Scenario A4 - start the three members of replica set rs0 on Linux/macOS.
# --fork runs each mongod in the background; logs go to /data/rs0-N/mongod.log
set -e

for i in 1 2 3; do
  port=$((27016 + i))
  mkdir -p /data/rs0-$i
  mongod --replSet rs0 --port $port --dbpath /data/rs0-$i \
         --bind_ip localhost --fork --logpath /data/rs0-$i/mongod.log
done

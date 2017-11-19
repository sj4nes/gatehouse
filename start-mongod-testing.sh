#!/bin/sh
mkdir -p db
nohup /usr/bin/mongod -dbpath ./db &
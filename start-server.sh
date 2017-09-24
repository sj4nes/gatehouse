#!/bin/sh
. ./env.sh
tsc && npm run build && npm start

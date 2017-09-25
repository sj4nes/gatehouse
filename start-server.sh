#!/bin/sh
. ./env.sh
npm update
tsc && npm run build && npm start

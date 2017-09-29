#!/bin/sh
. ./env.sh
npm update
npm run build && npm start

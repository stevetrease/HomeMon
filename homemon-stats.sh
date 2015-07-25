#!/bin/sh
cd /home/steve/node/homemon/homemon-stats
NODE_PATH=..
NODE_ENV=production nodemon homemon-stats.js

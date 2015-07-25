#!/bin/sh
cd /home/steve/node/homemon/homemon-server
NODE_PATH=..
NODE_ENV=production nodemon homemon-server.js

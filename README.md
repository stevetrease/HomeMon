HomeMon
=======

My home monitoring setup.
Based on using mosquitto to push MMQT messages from sensors. A pair of node.js processes then monitor for these messages and (1) calculate statistics (hourly energy usage, etc) and (2) server webpages to display data.


Requires:
- Express
- Socket.io
- Jade
- MQTT
- Redis
- Twitter Bootstrap
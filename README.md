HomeMon
=======

[![Build Status](https://travis-ci.org/stevetrease/HomeMon.png?branch=master)](https://travis-ci.org/stevetrease/HomeMon)

My home monitoring setup.
Based on using mosquitto to push MMQT messages from sensors. A pair of node.js servers then monitors for these messages and (1) calculate statistics (hourly energy usage, etc) and (2) server webpages to display data.

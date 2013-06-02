var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server, {'log level': 2});
var fs = require('fs');

// io.set("transports", ["xhr-polling", "jsonp-polling"]);


var names = new Array();
names["sensors/power/1"] = "IAM1";
names["sensors/power/2"] = "server";
names["sensors/power/3"] = "Steve's PC";
names["sensors/power/4"] = "Julie's PC";
names["sensors/power/5"] = "little lounge";
names["sensors/power/6"] = "kitchen";
names["sensors/power/7"] = "lounge";
names["sensors/power/8"] = "IAM8";
names["sensors/power/9"] = "IAM9";
names["sensors/power/U"] = "unknown";



// service settings file
var config = require('./config.json');

//
//	A whole load of very clumsy routing for static pages and js 
//
//	First of all log all connections
app.use(express.logger());
// app.use(express.compress());

app.use(express.static(__dirname + '/pages'));
app.use(express.static(__dirname + '/pages/js'));

// and finally a 404
app.use(function(req, res, next){
	res.send(404, 'Sorry cant find that!');
});


server.listen(8500);
console.log('listening on port 8500');



io.of('/sensors').on('connection', function (socket) {
	// subscribe to MQTT
	var mqtt = require('mqtt');
	var mqttclient = mqtt.createClient(parseInt(config.mqtt.port, 10), config.mqtt.host, function(err, client) {
		keepalive: 1000
	});
	mqttclient.on('connect', function() {
		mqttclient.subscribe('sensors/+/+');
		mqttclient.subscribe('sensors/power/0/cumulative/+');
		console.log('subscribing to sensors/+/+ on ' + config.mqtt.host + '(' + config.mqtt.port + ')');

  		mqttclient.on('message', function(topic, message) {
			// console.log('emitting topic: ' + topic + ' payload: ' + message);
			// figure out "friendly name and emit if known
			var name = null;
			if (names[topic] != undefined) {
				name = names[topic];
			}
  			socket.emit('data', { topic: topic, value: message, name: name });
  		});
  	});
});

io.of('/mqtt').on('connection', function (socket) {
	// subscribe to MQTT
	var mqtt = require('mqtt');
	var mqttclient = mqtt.createClient(parseInt(config.mqtt.port, 10), config.mqtt.host, function(err, client) {
		keepalive: 1000
	});
	mqttclient.on('connect', function() {
		mqttclient.subscribe('#');
		console.log('subscribing to everything on ' + config.mqtt.host + '(' + config.mqtt.port + ')');

  		mqttclient.on('message', function(topic, message) {
			// console.log('emitting topic: ' + topic + ' payload: ' + message);
  			socket.emit('data', { topic: topic, value: message });
  		});
  	});
});

io.of('/mqttstats').on('connection', function (socket) {
	// subscribe to MQTT
	var mqtt = require('mqtt');
	var mqttclient = mqtt.createClient(parseInt(config.mqtt.port, 10), config.mqtt.host, function(err, client) {
			keepalive: 1000
	});

	mqttclient.on('connect', function() {
		mqttclient.subscribe('$SYS/#');
		console.log('subscribing to $SYS on ' + config.mqtt.host + '(' + config.mqtt.port + ')');

  		mqttclient.on('message', function(topic, message) {
			// console.log('emitting topic: ' + topic + ' payload: ' + message);
  			socket.emit('data', { topic: topic, value: message });
  		});
  	});
});

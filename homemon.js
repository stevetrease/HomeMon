var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server, {'log level': 2});
var fs = require('fs');

// io.set("transports", ["xhr-polling", "jsonp-polling"]);


var names = new Array();
names["sensors/power/1"] = "one";
names["sensors/power/2"] = "two";
names["sensors/power/3"] = "three";
names["sensors/power/4"] = "four";
names["sensors/power/5"] = "five";
names["sensors/power/6"] = "six";
names["sensors/power/7"] = "seven";
names["sensors/power/8"] = "eight";
names["sensors/power/9"] = "nine";




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
			var name = null;
			if (names[topic] != undefined) {
				console.log(names[topic]);
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

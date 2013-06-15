// service settings file
var config = require('./config.json');

var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server, {'log level': 2});
var fs = require('fs');
var redis = require('redis')
	,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);
	

var names = {};
// var names = new Array();
names["sensors/power/1"] = "IAM1";
names["sensors/power/2"] = "Server";
names["sensors/power/3"] = "Steve's PC";
names["sensors/power/4"] = "Julie's PC";
names["sensors/power/5"] = "Little lounge";
names["sensors/power/6"] = "Kitchen";
names["sensors/power/7"] = "Lounge";
names["sensors/power/8"] = "IAM8";
names["sensors/power/9"] = "IAM9";
names["sensors/power/U"] = "Unknown";
names["sensors/humidity/jeenode-11"] = "Utility Room";
names["sensors/temperature/jeenode-11"] = "Utility Room";
names["sensors/temperature/garage"] = "Garage";
names["sensors/temperature/attic"] = "Attic";
names["sensors/pressure/attic"] = "Attic";
names["sensors/pressure/egpd"] = "Aberdeen Airport";
names["sensors/temperature/egpd"] = "Aberdeen Airport";




//
//	A whole load of very clumsy routing for static pages and js 
//
//	First of all log all connections
app.use(express.logger());
app.use(express.compress());

app.get('/about', function(req, res){
	res.send("About.");
});




app.get('/names', function(req, res){
	res.json(JSON.stringify(names));
});


app.get('/chartdata', function(req, res){
	// use node= to select a particular device
	switch (req.param('period')) {
		case 'daily':
			timeStart = new Date() - (7 * 24 * 3600 * 1000); // 7 days
			break;
		case 'hourly':
			timeStart = new Date() - (24 * 3600 * 1000); // 24 hours
			break;
		default:
			console.log ("illegal value of", req.param('period'), "for period argument");
	}
	timeEnd = new Date();
	redisClient.zrangebyscore("sensors/power/" + req.param('node') + "_" + req.param('period'), timeStart.valueOf(), timeEnd.valueOf(), function (err, members) {
		console.log("Returning", members.length, "items from Redis for deviceid", req.param('node'));	
		
		var parsedMembers = [];
		for (var i = 0; i < members.length; i++) { 
			var jsonData = JSON.parse(members[i]);
			var tDate = new Date(jsonData.time);
			switch (req.param('period')) {
				case 'daily':
					var formattedDate = tDate.getDay();
					break;
				case 'hourly':
					var formattedDate = tDate.getHours();
					break;
				default:
					console.log ("illegal value of", req.param('period'), "for period argument");
			}
			parsedMembers[i] = [ formattedDate.toString(), jsonData.value ];		
		}
		res.json(parsedMembers);
	});
});




// Static files
app.use(express.static(__dirname + '/pages'));
app.use(express.static(__dirname + '/pages/js'));

// and finally a 404
app.use(function(req, res, next){
	res.sendfile("pages/404.jpg");
	// res.send(404, "This is not the webpage you are looking for.");
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

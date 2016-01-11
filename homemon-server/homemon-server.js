console.log("process.env.NODE_ENV:" + process.env.NODE_ENV);
switch (process.env.NODE_ENV) {
	case 'development':
		console.log ("development mode");
		var config = require('../config.json');
		break;
	case 'production':
	default:	
		console.log ("production mode");
		var config = require('../config.json');
}


// function to if a string starts with nother one
String.prototype.beginsWith = function (string) {
    return(this.indexOf(string) === 0);
};

var names = require('../names.json');
var topicHistory = {};
var topicHistoryTimeStamp = {};


var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, {'log level': 1});

app.set('port', config.host_port);
app.set('host', "127.0.0.1");
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger());
app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes');
var page_mqtt = require('./routes/page_mqtt');
var page_mqttstats = require('./routes/page_mqttstats');
var page_power = require('./routes/page_power');
var page_powerbar = require('./routes/page_powerbar');
var page_pushmessage = require('./routes/page_pushmessage');
var page_sensors = require('./routes/page_sensors');
var page_sensors2 = require('./routes/page_sensors2');
var page_snmp = require('./routes/page_snmp');



app.get('/', routes.index);
app.get('/mqtt', page_mqtt.page);
app.get('/pushmessage', page_pushmessage.page);
app.get('/mqttstats', page_mqttstats.page);
app.get('/power', page_power.page);
app.get('/powerbar', page_powerbar.page);
app.get('/pushmessage', page_pushmessage.page);
app.get('/sensors', page_sensors.page);
app.get('/sensors2', page_sensors2.page);
app.get('/snmp', page_snmp.page);


// and finally a 404
app.use(function(req, res, next){
	res.send(404, "This is not the webpage you are looking for.");
});
server.listen(config.host_port, 'localhost');
console.log('listening on port ' + config.host_port);


io.sockets.on('connection', function (socket) {
	socket.on('subscribe', function(data) {
		console.log (socket.id + " on " + socket.request.connection.remoteAddress + " subscribed to room " + data.room );
		socket.join(data.room);
		
		var time = new Date ();
		var length = 0;		
		var emitted = 0;		
		// since this is a new subscription, emit all historised messages to setup client with initial values
		for (i in topicHistory) {
			length++;
			// only emit if less that 30 seconds old
			if (((time - topicHistoryTimeStamp[i]) / 1000) < 300) { 
				emitted++;
				mqttclient.publish(i, topicHistory[i]);
				// console.log(i + " " + topicHistory[i]);
			}
		}
		console.log ("emited " + emitted + " of " + length + " messages");
	});
});


var nsp = io.of('/');
nsp.on('connection', function(socket){
	console.log(socket.id + " on " + socket.request.connection.remoteAddress + " connected connected to /");
});



var mqtt = require('mqtt');
var mqttclient = mqtt.connect(config.mqtt.host, config.mqtt.options);

mqttclient.on('connect', function() {
        // mqttclient.subscribe('jsonsensors');
        mqttclient.subscribe('#');
        mqttclient.subscribe('$SYS/#');
        mqttclient.on('message', function(topic, message) {    
	        var value = Number(message);
	        messageString = value.toString();
	        // console.log (topic + "     " + message.toString());
	        
	        if (topic == "push/alert") {
				io.sockets.in("pushmessage").emit('data', { topic: message.toString() });	        
		    }
		    
	        if (topic == "jsonsensors") {
		        // var messageData = JSON.parse(message.toString());
				//io.sockets.in("mqtt").emit('data', { topic: messageData.topic, value: messageData.value });				
			}
			
			if (topic.beginsWith("$SYS/")) {
				io.sockets.in("mqttstats").emit('data', { topic: topic, value: message.toString() });	
			}
			
			if (topic.beginsWith("snmp")) {
				// console.log(message.toString());
				io.sockets.in("snmp").emit('data', { message: message.toString() });	
			}
			
			// retain messages so that we have starting data for new clients
			if (topic.beginsWith("sensors/")) {
				var time = new Date();
				topicHistoryTimeStamp[topic] = time;
				topicHistory[topic] = message;
			}	        
			
			if (topic.beginsWith("sensors/power")) {
				var name = null;
				if (names[topic] != undefined) name = names[topic].name;
				messageString = value.toFixed(0);
				io.sockets.in("power").emit('data', { topic: topic, value: messageString, name: name });	
			}
			
			if (topic.beginsWith("sensors/power") || topic.beginsWith("rate/sensors/snmp/router/total")
			|| topic.beginsWith("sensors/power") || topic.beginsWith("sensors/co/") || topic.beginsWith("sensors/co2/")
			|| topic.beginsWith("sensors/no2") || topic.beginsWith("sensors/pressure")) {
				var name = null;
				if (names[topic] != undefined) name = names[topic].name;
				io.sockets.in("sensors").emit('data', { topic: topic, value: messageString, name: name });	
			}
			
			if (topic.beginsWith("sensors/co/") || topic.beginsWith("sensors/co2/")
			|| topic.beginsWith("sensors/temperature/") || topic.beginsWith("sensors/humidity/")
			|| topic.beginsWith("sensors/no2") || topic.beginsWith("sensors/pressure")) {
				var name = null;
				if (names[topic] != undefined) name = names[topic].name;
				io.sockets.in("sensors2").emit('data', { topic: topic, value: messageString, name: name });	
			}


			if (topic.beginsWith("sensors/iosbattery")) {
				var name = null;
				if (names[topic] != undefined) name = names[topic].name;
				var p = value * 100;
				messageString = p.toFixed(0);
				io.sockets.in("sensors").emit('data', { topic: topic, value: messageString, name: name });	
			}

			if (topic.beginsWith("sensors/humidity")) {
				var name = null;
				if (names[topic] != undefined) name = names[topic].name;
				messageString = value.toFixed(0) + "%";
				io.sockets.in("sensors").emit('data', { topic: topic, value: messageString, name: name });	
				io.sockets.in("humidity").emit('data', { topic: topic, value: messageString, name: name });	
			}
			
			if (topic.beginsWith("sensors/temperature") || topic.beginsWith("sensors/boiler")) {
				var name = null;
				if (names[topic] != undefined) name = names[topic].name;
				messageString = value.toFixed(1);
				io.sockets.in("sensors").emit('data', { topic: topic, value: messageString, name: name });	
				io.sockets.in("temperature").emit('data', { topic: topic, value: messageString, name: name });	
			}
			
			if (topic == "cumulative/hour/sensors/power/0" || topic == "cumulative/daily/sensors/power/0") {
				io.sockets.in("sensors").emit('data', { topic: topic, value: messageString });
			}
			
			if (topic.beginsWith("cumulative/hour/sensors/power/") || topic.beginsWith("cumulative/daily/sensors/power/")) {
				io.sockets.in("power_cumulative").emit('data', { topic: topic, value: messageString });
			}

			// emit everything to the mqtt room
			io.sockets.in("mqtt").emit('data', { topic: topic, value: message.toString() });			
       });
});
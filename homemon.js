var config = require('./config.json');

var fs = require('fs');

// lines for https
var privateKey = fs.readFileSync('sslcert/server.key');
var certificate = fs.readFileSync('sslcert/server.crt');
var sslCredentials = {key: privateKey, cert: certificate};



var express = require('express')
var app = express()
var http = require('https')
var server = http.createServer(sslCredentials, app)
var io = require('socket.io').listen(server, {'log level': 2});
var path = require('path');
var redis = require('redis')
	,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);
 

var routes = require('./routes')
  , page_sensors = require('./routes/page_sensors')
  , pages2 = require('./routes/page2')
  , page_powercharts = require('./routes/page_powercharts')
  , page_mqtt = require('./routes/page_mqtt')
  , page_mqttstats = require('./routes/page_mqttstats')


// Friendly names 
var names = {};
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






// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret sgdf sdhafjlkas'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/sensors', page_sensors.page);
app.get('/page2', pages2.page);
app.get('/powercharts', page_powercharts.page)
app.get('/mqtt', page_mqtt.page);
app.get('/mqttstats', page_mqttstats.page);
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
		res.json(members);
	});
});

// and finally a 404
app.use(function(req, res, next){
	// res.sendfile("pages/404.jpg");
	res.send(404, "This is not the webpage you are looking for.");
});


server.listen(8500);
console.log('listening on port 8500');







// sockert.io emitters
//
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

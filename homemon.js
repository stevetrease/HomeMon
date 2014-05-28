var config = require('./config.json');

var fs = require('fs');

// lines for https
var privateKey = fs.readFileSync('sslcert/server.key');
var certificate = fs.readFileSync('sslcert/server.crt');

var sslOptions = {	key: privateKey,
					cert: certificate,
					ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
					honorCipherOrder: true };

var express = require('express')
var app = express()
var http = require('https')
var server = http.createServer(sslOptions, app)
var io = require('socket.io').listen(server, {'log level': 1});
io.set("transports", ["xhr-polling", "jsonp-polling"]); // so it works quicker via squid
var path = require('path');
var redis = require('redis')
	,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);
  

var routes = require('./routes')
  , page_sensors = require('./routes/page_sensors')
  , page_power = require('./routes/page_power')
  , page_powerbar = require('./routes/page_powerbar')
  , page_mqtt = require('./routes/page_mqtt')
  , page_mqttstats = require('./routes/page_mqttstats')
  , page_redisstats = require('./routes/page_redisstats')





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
names["sensors/humidity/jeenode-15"] = "AQE";
names["sensors/humidity/egpd"] = "Aberdeen Airport";
names["sensors/temperature/jeenode-11"] = "Utility Room";
names["sensors/temperature/jeenode-13"] = "Kitchen";
names["sensors/temperature/jeenode-15"] = "AQE";
names["sensors/temperature/garage"] = "Garage";
names["sensors/temperature/attic"] = "Attic";
names["sensors/pressure/attic"] = "Attic";
names["sensors/pressure/egpd"] = "Aberdeen Airport";
names["sensors/temperature/egpd"] = "Aberdeen Airport";






// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger());
app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('cookie secret key 71f9fdb0-85df-11e3-920a-6cf049deda8a'));
app.use(express.session({ secret: 'session secret key 790055d2-85df-11e3-85b0-6cf049deda8a' }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/sensors', page_sensors.page);
app.get('/power', page_power.page);
app.get('/powerbar', page_powerbar.page);
app.get('/mqtt', page_mqtt.page);
app.get('/mqttstats', page_mqttstats.page);
app.get('/redisstats', page_redisstats.page);


app.get('/names', function(req, res){
	res.json(JSON.stringify(names));
});


// and finally a 404
app.use(function(req, res, next){
	res.send(404, "This is not the webpage you are looking for.");
});




server.listen(8500);
console.log('listening on port 8500');



// sockert.io emitters
io.of('/sensors').on('connection', function (socket) {
	// subscribe to MQTT
	var mqtt = require('mqtt');
	var mqttclient = mqtt.createClient(parseInt(config.mqtt.port, 10), config.mqtt.host, function(err, client) {
		keepalive: 1000
	});
	mqttclient.on('connect', function() {
		mqttclient.subscribe('sensors/+/+');
		mqttclient.subscribe('cumulative/+/sensors/power/0');

  		mqttclient.on('message', function(topic, message) {
			// figure out "friendly name and emit if known
			var name = null;
			if (names[topic] != undefined) name = names[topic];
  			socket.emit('data', { topic: topic, value: message, name: name });
  		});
  	});
});



io.of('/power').on('connection', function (socket) {
	// subscribe to MQTT
	var mqtt = require('mqtt');
	var mqttclient = mqtt.createClient(parseInt(config.mqtt.port, 10), config.mqtt.host, function(err, client) {
		keepalive: 1000
	});
	mqttclient.on('connect', function() {
		mqttclient.subscribe('sensors/power/+');
		mqttclient.subscribe('cumulative/+/sensors/power/+');

  		mqttclient.on('message', function(topic, message) {
			// figure out "friendly name and emit if known
			var name = null;
			if (names[topic] != undefined) name = names[topic];
  			socket.emit('data', { topic: topic, value: message, name: name });
  		});
  	});
});



io.of('/powerbar').on('connection', function (socket) {
	// subscribe to MQTT
	var mqtt = require('mqtt');
	var mqttclient = mqtt.createClient(parseInt(config.mqtt.port, 10), config.mqtt.host, function(err, client) {
		keepalive: 1000
	});
	mqttclient.on('connect', function() {
		mqttclient.subscribe('sensors/power/+');
  		mqttclient.on('message', function(topic, message) {
  			// figure out "friendly name and emit if known
			var name = null;
			if (names[topic] != undefined) name = names[topic];
  			if (topic != "sensors/power/0")
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
  		mqttclient.on('message', function(topic, message) {
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
  		mqttclient.on('message', function(topic, message) {
  			socket.emit('data', { topic: topic, value: message });
  		});
  	});
});

// redis runtime stats
io.of('/redisstats').on('connection', function (socket) {
	var redis = require('redis')
	   ,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);
	redisClient.info(function (err, reply) {
		var s = reply.split("\r\n");
		for (var key in s) {
			t = s[key].split(":")
			if (t[0] != "" && typeof(t[1]) != "undefined") {
				socket.emit('data', { topic: t[0], value: t[1]});
			}
		}
  	});
});




// Advertise the service with Bonjour so that it can be found on the LAN
// var mdns = require('mdns');
// var ad = mdns.createAdvertisement(mdns.tcp('http'), 8500);
// ad.start();

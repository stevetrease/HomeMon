// service settings file
var config = require('./config.json');

var redis = require('redis')
  ,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);



BeginsWith = function(needle, haystack) {
	return (haystack.substr(0, needle.length) == needle);
}



redisClient.on('connect'     , log('connect'));
redisClient.on('ready'       , log('ready'));
redisClient.on('reconnecting', log('reconnecting'));
redisClient.on('error'       , log('error'));
function log(type) {
    return function() {
        console.log(type, arguments);
    }
}

var records_hourly = {};
var records_daily =  {};
var records_lasttime = {};
var records_lastvalue = {};

// get last stored values from Redis
// needs to be blocking to get everything initialised nicely when starting
var execSync = require('execSync');
var result = execSync.exec('redis-cli get records_hourly');
records_hourly = JSON.parse(result.stdout);
console.log("Loading hourly records from redis...");
result = execSync.exec('redis-cli get records_daily');
records_daily = JSON.parse(result.stdout);
console.log("Loading daily records from redis...");


// connect to to MQTT
var mqtt = require('mqtt');
var mqttclient = mqtt.createClient(parseInt(config.mqtt.port,10), config.mqtt.host, function(err, client) {
		keepalive: 1000
});

mqttclient.on('connect', function() {
	var savecount = 0;
	mqttclient.subscribe('sensors/power/+');
	console.log('subscribing to sensors/power/+ on ' + config.mqtt.host + '(' + config.mqtt.port + ')');
	mqttclient.subscribe('sensors/snmp/+/+');
	console.log('subscribing to sensors/snmp/+/+ on ' + config.mqtt.host + '(' + config.mqtt.port + ')');

  	mqttclient.on('message', function(topic, message) {
		var currenttime = new Date();

		// have we seen this mesage before? 
		if(records_lasttime[topic] == undefined) {
			// console.log("initialising lasttime: "  + topic);
			records_lasttime[topic] = new Date();
		}
		if(records_hourly[topic] == undefined) {
			// console.log("initialising records_hourly:" + topic);
			records_hourly[topic] = 0;
		}
		if(records_daily[topic] == undefined) {
			// console.log("initialising records_daily: " + topic);
			records_daily[topic] = 0;
		}
		if(records_lastvalue[topic] == undefined) {
			// console.log("initialising lastvalue: " + topic);
			records_lastvalue[topic] = 0;
		}

		// different hour?
		if (records_lasttime[topic].getHours() != currenttime.getHours()) {
			records_hourly[topic] = 0;
		}
		// different day?
		if (records_lasttime[topic].getDate() != currenttime.getDate()) {
			records_daily[topic] = 0;
		}

		// Run this code for power records
		// calculate cumulative power used in KWh
		var duration = (currenttime - records_lasttime[topic]); // in milli seconds
		

		// Record is power
		if (BeginsWith("sensors/power/", topic)) {	
			// console.log ("power - ", topic, duration);	
			var powerused = parseInt(message, 10) * ((duration / 1000.0) / 3600.0) / 1000.0; // convert to KWh
			records_lasttime[topic] = currenttime;
			records_hourly[topic] += powerused;
			records_daily[topic] += powerused;
			records_lastvalue[topic] = parseInt(message, 10);
			// console.log("topic:", topic, " duration ", duration, " period ", powerused, " hour ", records_hourly[topic], "daily ", records_daily[topic]);
			
			// publish new data
			mqttclient.publish(topic + "/cumulative/hour", records_hourly[topic].toFixed(2));
			mqttclient.publish(topic + "/cumulative/daily", records_daily[topic].toFixed(2));
		}
		
		// record is SNMP
		if (BeginsWith("sensors/snmp/", topic)) {
			// console.log ("snmp - ", topic, duration);	
			var snmp = parseInt(message, 10); 
			var used = (snmp - records_lastvalue[topic]);
			var rate = used * 8.0 / 1000000 * (duration / 1000.0); // in Mbps
			records_lasttime[topic] = currenttime;
			records_hourly[topic] += used;
			records_daily[topic] += used;
			records_lastvalue[topic] = parseInt(message, 10);
			// publish new data
			mqttclient.publish(topic + "/cumulative/hour", records_hourly[topic].toFixed(0));
			mqttclient.publish(topic + "/cumulative/daily", records_daily[topic].toFixed(0));
			mqttclient.publish(topic + "/rate", rate.toFixed(2));

		}
		
		// each time we get power/0 caculate then publish the "unknown power draw" and publish to power/U
		if(topic == "sensors/power/0") {
			var known = 0;
			for (var key in records_lastvalue) {
				// only it it matches sensors/power/[0-9]
				if (key.length == 15 && key != "sensors/power/0" && key != "sensors/power/U") {
					// console.log(key, known, records_lastvalue[key]);
					known += records_lastvalue[key]; 
				}
			}
			var unknown = records_lastvalue["sensors/power/0"] - known;
			// console.log("unknown power calulated to be ", unknown);
			mqttclient.publish("sensors/power/U", unknown.toFixed(0));
		}
  	});
});


var savePeriod = 65; // in seconds
setInterval (function () {
	console.log("saving to redis...");
	redisClient.set("records_hourly", JSON.stringify(records_hourly));
	redisClient.set("records_daily", JSON.stringify(records_daily));
	redisClient.set("records_lasttime", JSON.stringify(records_lasttime));
}, savePeriod * 1000);



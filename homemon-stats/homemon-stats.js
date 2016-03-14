// service settings file
console.log("process.env.NODE_ENV:" + process.env.NODE_ENV);
switch (process.env.NODE_ENV) {
	case "development":
		console.log ("development mode");
		var config = require("../config.json");
		break;
	case "production":
	default:
		console.log ("production mode");
		var config = require("../config.json");
}



var redis = require("redis")
	,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);



BeginsWith = function(needle, haystack) {
	return (haystack.substr(0, needle.length) === needle);
}



var recordsHourly = {};
var recordsDaily = {};
var recordsLastTime = {};
var recordsLastValue = {};

// get last stored values from Redis
// needs to be blocking to get everything initialised nicely when starting
var execSync = require("sync-exec");

var result = execSync("redis-cli -h " + config.redis.host + " get recordsHourly");
console.log("Loading hourly records from redis...");
try {
	recordsHourly = JSON.parse(result.stdout);
	console.log ("records loaded");
} catch (error) {
	console.log ("no records loaded");
}

result = execSync("redis-cli -h " + config.redis.host + " get recordsDaily");
console.log("Loading daily records from redis...");
try {
	recordsDaily = JSON.parse(result.stdout);
	console.log ("records loaded");
} catch (error) {
	console.log ("no records loaded");
}



// connect to to MQTT
var mqtt = require("mqtt");
var mqttclient = mqtt.connect(config.mqtt.host, config.mqtt.options);

mqttclient.on("connect", function() {
	mqttclient.subscribe("sensors/power/+");
	console.log("subscribing to sensors/power/+ on " + config.mqtt.host);
	mqttclient.subscribe("sensors/snmp/+/+");
	console.log("subscribing to sensors/snmp/+/+ on " + config.mqtt.host);
	mqttclient.subscribe("sensors/temperature/+");
	console.log("subscribing to sensors/temperature/+ on " + config.mqtt.host);

	mqttclient.on("message", function(topic, message) {
		var currenttime = new Date();

		// have we seen this mesage before? 
		if(recordsLastTime[topic] == undefined) {
			recordsLastTime[topic] = new Date();
		}
		if(recordsHourly[topic] == undefined) {
			recordsHourly[topic] = 0;
		}
		if(recordsDaily[topic] == undefined) {
			recordsDaily[topic] = 0;
		}
		if(recordsLastValue[topic] == undefined) {
			recordsLastValue[topic] = 0;
		}

		// publish current power stats for LCD display
		if (BeginsWith("sensors/power/0", topic)) {
			mqttclient.publish("LCD/1/line/0", message + "  " + 
			recordsHourly[topic].toFixed(1) + "  " + recordsDaily[topic].toFixed(1));
		}


		// different hour?
		if (recordsLastTime[topic].getHours() != currenttime.getHours()) {
			// and historize	
			var messages = {
				time: recordsLastTime[topic].getTime(),
				value: recordsHourly[topic]	
			}
			redisClient.zadd(topic + "_hourly", currenttime.getTime(), JSON.stringify(messages));
			recordsHourly[topic] = 0;
		}
		// different day?
		if (recordsLastTime[topic].getDate() != currenttime.getDate()) {
			// and historize
			var messages = {
				time: recordsLastTime[topic].getTime(),
				value: recordsDaily[topic]	
			}
			redisClient.zadd(topic + "_daily", currenttime.getTime(), JSON.stringify(messages));
			// reset accumulator
			recordsDaily[topic] = 0;
		}


		// Run this code for power records
		// calculate cumulative power used in KWh
		var duration = (currenttime - recordsLastTime[topic]); // in milli seconds


		// Record is power
		if (BeginsWith("sensors/power/", topic)) {	
			// console.log ("power - ", topic, duration);	
			var powerused = parseInt(message, 10) * ((duration / 1000.0) / 3600.0) / 1000.0; // convert to KWh
			if (isNaN(powerused)) {
				console.log ("NAN powerused: " + topic);
				powerused = 0;
			}
			recordsLastTime[topic] = currenttime;
			recordsHourly[topic] += powerused;
			recordsDaily[topic] += powerused;
			recordsLastValue[topic] = parseInt(message, 10);
			// console.log("topic:", topic, " duration ", duration, " period ", powerused, " hour ", recordsHourly[topic], "daily ", recordsDaily[topic]);

			// publish new data
			mqttclient.publish("cumulative/hour/" + topic, recordsHourly[topic].toFixed(2));
			mqttclient.publish("cumulative/daily/" + topic, recordsDaily[topic].toFixed(2));


			var v = powerused.toFixed(10);
			if (!isNaN(v)) {	
				var time = new Date();
				time.setMinutes(0);
				time.setSeconds(0);
				time.setMilliseconds(0);
				redisClient.hincrbyfloat("hourly-" + topic, time, v);
				time.setHours(0);
				redisClient.hincrbyfloat("daily-" + topic, time, v);		
			}
		}

		// record is SNMP
		if (BeginsWith("sensors/snmp", topic)) {
			// console.log ("snmp - ", topic, duration);	
			var snmp = parseInt(message, 10); 
			var used = (snmp - recordsLastValue[topic]);
			if (used < 0) used = 0;
			var rate = used * 8.0 / 1000000 * (duration / 1000.0); // in Mbps
			recordsLastTime[topic] = currenttime;
			recordsHourly[topic] += used;
			recordsDaily[topic] += used;
			recordsLastValue[topic] = parseInt(message, 10);
			// publish new data
			mqttclient.publish("cumulative/hour/" + topic, recordsHourly[topic].toFixed(0));
			mqttclient.publish("cumulative/daily/" + topic, recordsDaily[topic].toFixed(0));
			mqttclient.publish("rate/" + topic, rate.toFixed(2));
		}

		// each time we get power/0 caculate then publish the "unknown power draw" and publish to power/U
		if(topic == "sensors/power/0") {
			var known = 0;
			for (var key in recordsLastValue) {
				// only it it matches sensors/power/[0-9]
				if (key.length == 15 && key != "sensors/power/0" && key != "sensors/power/U") {
					// console.log(key, known, recordsLastValue[key]);
					known += recordsLastValue[key]; 
				}
			}
			var unknown = recordsLastValue["sensors/power/0"] - known;
			if (unknown < 0) unknown = 0;
			mqttclient.publish("sensors/power/U", unknown.toFixed(0));
		}
	});
});


// var MongoClient = require ("mongodb").MongoClient;



var mqtt2 = require("mqtt");
var mqttclient2 = mqtt2.connect(config.mqtt.host, config.mqtt.options);

mqttclient2.on("connect", function() {
	mqttclient2.subscribe("sensors/#");
	console.log("subscribing to sensors/# on " + config.mqtt.host);

	mqttclient2.on("message", function(topic, message) {
		var time = new Date();
		var jsonMessage = {
			topic: topic,
			value: Number(message.toString()),
			timeStamp: Number(time)
		};

		mqttclient2.publish("jsonsensors", JSON.stringify(jsonMessage));

		// MongoClient.connect (config.mongo.host, function (err, db) {
		// 	db.collection ("homedata").insertOne (jsonMessage);
		// 	db.close ();
		// });
	});
});




savestate = function() {
	// console.log("saving to redis...");
	redisClient.set("recordsHourly", JSON.stringify(recordsHourly));
	redisClient.set("recordsDaily", JSON.stringify(recordsDaily));
	redisClient.set("recordsLastTime", JSON.stringify(recordsLastTime));
};

// frequently store cumulative date to preserve it across restarts, etc.
var savePeriod = 65; // in seconds
setInterval (savestate, savePeriod * 1000);
process.on("SIGUSR1", savestate);	// and save on signal

// service settings file
var config = require('./config.json');

var redis = require('redis')
	  ,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);



redisClient.on('reconnecting', log('reconnecting'));
redisClient.on('error'       , log('error'));
function log(type) {
    return function() {
        console.log(type, arguments);
    }
}



redisClient.on('ready', function () {
	log('ready');
	
	


	timeEnd = new Date();
	timeStart = new Date(timeEnd - (1000 * 3600 * 24));
	
	console.log("Start: ", timeStart);
	console.log("End:   ", timeEnd);
	
	timeEnd.setMilliseconds(0);
	timeEnd.setSeconds(0);
	timeEnd.setMinutes(0);
	timeStart = new Date(timeEnd - (1000 * 3600 * 24));
	
	console.log("Start: ", timeStart);
	console.log("End:   ", timeEnd);

	redisClient.zrangebyscore("timeseries-sensors/power/0", timeStart.valueOf(), timeEnd.valueOf(), function (err, members) {
		console.log("Returning", members.length, "items from Redis");	
		var timeseries = [];
		for (var key in members) {
			timeseries.push(JSON.parse(members[key]));
		}
		
		var i = 1;
		var energyCum = 0;
		var energyMax = parseInt(timeseries[0].value,10);
		var energyMin = parseInt(timeseries[0].value,10);
		var lasttime = parseInt(timeseries[0].time,10);
		do {
			var interval = parseInt(timeseries[i].time,10) - lasttime;
			var energy = parseInt(timeseries[i].value,10);
			
			energyCum = energyCum + ((interval) / 1000.0 * energy);
			if (energy > energyMax) energyMax = energy;
			if (energy < energyMin) energyMin = energy;

			
			lasttime = parseInt(timeseries[i].time,10);
			i++;
		} while (i < timeseries.length)
		console.log((energyCum / 3600).toFixed(1), energyMin, energyMax);
		process.exit(1);
	});
});
// service settings file
var config = require('./config.json');

var redis = require('redis')
  ,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);


timeStart = new Date();
timeEnd = new Date();

redisClient.zrangebyscore("sensors/power/0_hourly", 0, timeEnd.valueOf(), function (err, members) {
	console.log(members.length);	
	console.log();
	console.log(members);
	// console.log();
	// Object.keys(members).forEach (function (item) {
		//console.log(members[item]);
		// console.log(match(members[item], {}));
	//})
});
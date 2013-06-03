// service settings file
var config = require('./config.json');

var redis = require('redis')
  ,redisClient = redis.createClient(parseInt(config.redis.port,10), config.redis.host);


timeStart = new Date();
timeEnd = new Date();

redisClient.zrangebyscore("currentcost0", (timeStart.valueOf() / 1000) - (60), (timeEnd.valueOf() / 1000), function (err, members) {
	// console.log(members.length);	
	// console.log();
	// console.log(members);
	// console.log();
	Object.keys(members).forEach (function (item) {
		console.log(members[item]);
		console.log(match(members[item], {}));
	})
});
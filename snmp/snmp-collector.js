// service settings file
var config = require('../config.json');




var snmp = require ("net-snmp");

var session = snmp.createSession ("192.168.1.1", "public");

var oids = ["1.3.6.1.2.1.2.2.1.16.6", "1.3.6.1.2.1.2.2.1.10.6"];




var lastTime = new Date();

var lastUp = 0;
var lastDown = 0;



// connect to to MQTT
var mqtt = require('mqtt');
var mqttclient = mqtt.createClient(parseInt(config.mqtt.port,10), config.mqtt.host, function(err, client) {
		keepalive: 1000
});


// using SetInterval to poll SNMP every poll milliseconds.
var poll = 666;
setInterval (function () {
	session.get (oids, function (error, varbinds) {
	    if (error) {
	        console.log (error);
	    } else {
	        
						
	     	// for (var i = 0; i < varbinds.length; i++) {
	            // if (snmp.isVarbindError (varbinds[i])) {
	         	   // console.log (snmp.varbindError (varbinds[i]));
	            // } else {
	                // console.log (varbinds[i].oid + " = " + varbinds[i].value);
	            // }
			// }
			
			var now = new Date();
			var period = now.getTime() - lastTime.getTime();
					
			var up = varbinds[0].value;
			var down = varbinds[1].value;
			
			var diffUp = up - lastUp;
			var diffDown = down - lastDown;
			
			var mbpsUp = ((diffUp * 8.0) / 1000000.0) * (period / 1000.0);
			var mbpsDown = ((diffDown * 8.0) / 1000000.0) * (period / 1000.0);
			var mbpsTotal = (((diffUp + diffDown) * 8.0) / 1000000.0) * (period / 1000.0);
						
			// console.log (period, "-", up, ":", down, "-", diffUp,":", diffDown);
			console.log (period, "-", mbpsTotal, "-", mbpsUp,":", mbpsDown);
			
			mqttclient.publish("sensors/bandwidth/router/up", mbpsUp.toFixed(2));
			mqttclient.publish("sensors/bandwidth/router/down", mbpsDown.toFixed(2));
			mqttclient.publish("sensors/bandwidth/router/total", mbpsTotal.toFixed(2));
			
			lastTime = now;
			lastUp = up;
			lastDown = down;
	    }
	});
 }, poll);




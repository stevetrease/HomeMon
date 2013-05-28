// service settings file
var config = require('../config.json');
var snmp = require ("net-snmp");



// connect to to MQTT
var mqtt = require('mqtt');
var mqttclient = mqtt.createClient(parseInt(config.mqtt.port,10), config.mqtt.host, function(err, client) {
	keepalive: 1000
});





function snmp_data () {
	this.host = null;
	this.oids = null;
	this.lastTime = null;
	this.lastUp = null;
	this.lastDown = null;
	this.session = null;
	this.lastTime = null;
	this.lastUp = null;
	this.lastDown = null;
	this.name = null;
}

var snmp_data_array = [];


snmp_data_array[0] = { name: 'router', host: '192.168.1.1', oids: [ '1.3.6.1.2.1.2.2.1.16.6', '1.3.6.1.2.1.2.2.1.10.6' ] };
snmp_data_array[1] = { name: 'wifi-1', host: '192.168.1.252', oids: [ '1.3.6.1.2.1.2.2.1.16.6', '1.3.6.1.2.1.2.2.1.17.6' ] };
snmp_data_array[2] = { name: 'wifi-2', host: '192.168.1.252', oids: [ '1.3.6.1.2.1.2.2.1.16.7', '1.3.6.1.2.1.2.2.1.17.7' ] };
snmp_data_array[3] = { name: 'gs108t-1', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.1', '1.3.6.1.2.1.2.2.1.11.1' ] };
snmp_data_array[4] = { name: 'gs108t-2', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.2', '1.3.6.1.2.1.2.2.1.11.2' ] };
snmp_data_array[5] = { name: 'gs108t-3', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.3', '1.3.6.1.2.1.2.2.1.11.3' ] };
snmp_data_array[6] = { name: 'gs108t-4', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.4', '1.3.6.1.2.1.2.2.1.11.4' ] };
snmp_data_array[7] = { name: 'gs108t-5', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.5', '1.3.6.1.2.1.2.2.1.11.5' ] };
snmp_data_array[8] = { name: 'gs108t-6', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.6', '1.3.6.1.2.1.2.2.1.11.6' ] };
snmp_data_array[9] = { name: 'gs108t-7', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.7', '1.3.6.1.2.1.2.2.1.11.7' ] };
snmp_data_array[10] = { name: 'gs108t-8', host: '192.168.1.248', oids: [ '1.3.6.1.2.1.2.2.1.10.8', '1.3.6.1.2.1.2.2.1.11.8' ] };


 

for (var key in snmp_data_array) {
   	snmp_data_array[key].lastTime = new Date();
	snmp_data_array[key].session = snmp.createSession (snmp_data_array[key].host, config.community);
	
	// using SetInterval to poll SNMP every poll milliseconds.
	var pollPeriod = 666 + Math.floor(Math.random()*50);
	console.log ("Initiating " + snmp_data_array[key].name + " every " + pollPeriod);
	setInterval (executeSNMP, pollPeriod, snmp_data_array[key]); 
}



function executeSNMP (x) {
	x.session.get (x.oids, function (error, varbinds) {
		if (error) {
	    	console.log (error);
	    } else {
			// console.log(x.host, varbinds[0].value, varbinds[1].value);
			
			var now = new Date();
			var period = now.getTime() - x.lastTime.getTime();
					
			var up = varbinds[0].value;
			var down = varbinds[1].value;
			
			var diffUp = up - x.lastUp;
			var diffDown = down - x.lastDown;
			
			var mbpsUp = ((diffUp * 8.0) / 1000000.0) * (period / 1000.0);
			var mbpsDown = ((diffDown * 8.0) / 1000000.0) * (period / 1000.0);
			var mbpsTotal = (((diffUp + diffDown) * 8.0) / 1000000.0) * (period / 1000.0);
						
			// console.log (period, "-", up, ":", down, "-", diffUp,":", diffDown);
			// console.log (period, "-", mbpsTotal, "-", mbpsUp,":", mbpsDown);
			
			// mqttclient.publish("sensors/bandwidth/" + x.name + "/up", mbpsUp.toFixed(2));
			// mqttclient.publish("sensors/bandwidth/" + x.name + "/down", mbpsDown.toFixed(2));
			mqttclient.publish("sensors/bandwidth/" + x.name + "/total", mbpsTotal.toFixed(2));
			
			mqttclient.publish("sensors/snmp/" + x.name + "/up", up.toFixed(0));
			mqttclient.publish("sensors/snmp/" + x.name + "/down", down.toFixed(0));
			
			x.lastTime = now;
			x.lastUp = up;
			x.lastDown = down;
		}
	});
};

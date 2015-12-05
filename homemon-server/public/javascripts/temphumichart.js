ElementExists = function(id) {
		return !!document.getElementById(id);
};
BeginsWith = function(needle, haystack) {
	return (haystack.substr(0, needle.length) == needle);
}

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart','table']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);

function drawChart() {
  	var data = new google.visualization.DataTable();	           

  	var dataArray = [];
  	var temperatureData = {};
  	var humidityData = {};
  	
	// Instantiate and draw our chart	 
	var options = { height: 500,
	               legend: { position: 'none' },
	               hAxis: { title: 'Temperature'},
		           vAxis: { title: 'Humidity' },
	               animation: { duration: 250, easing: 'linear'}
	               };
	
	var chart = new google.visualization.ScatterChart(document.getElementById('temphumichart'));
	
	data.addColumn('number', 'Humidity');
	data.addColumn('number', 'Temperature');

	var updates = 0;
	var socket = io.connect("http://homemon.trease.eu:8500/");
	socket.emit("subscribe", { room: "temperature" });
	socket.emit("subscribe", { room: "humidity" });
	socket.on('data', function(message) { 
		
		//console.log (message.name);

		if (BeginsWith ('sensors/temperature', message.topic)) {
			// console.log('temperature');
			temperatureData[message.name] = parseInt(message.value, 10);	
		} else if (BeginsWith ('sensors/humidity', message.topic)) {
			// console.log('humidity');	
			humidityData[message.name] = parseInt(message.value, 10);
		} else {
			return
		}
		
		// do we have both a humdity and a temperature value?
		if (!(typeof humidityData[message.name] === 'undefined') && !(typeof temperatureData[message.name] === 'undefined')) {
			console.log ("temperatue and humidity exist " + message.name + " " + temperatureData[message.name] + " " + humidityData[message.name]);
			data.addRows([[temperatureData[message.name],humidityData[message.name]]]);
		} else {
			return;
		}
		
		chart.draw(data, options);
		
		var dt = new Date(); 
		document.getElementById("time").innerHTML= dt.toLocaleTimeString();
		document.getElementById("updates").innerHTML= ++updates;
	});
}
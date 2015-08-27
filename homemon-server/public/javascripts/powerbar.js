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

  	data.addColumn('string', 'Label');
  	data.addRow();
	
	// Instantiate and draw our chart	 
	var options = {height: 300,
	               legend: {position: 'bottom'},
	               animation: { duration: 250, easing: 'linear'},
	               isStacked: true};
	
	var chart = new google.visualization.BarChart(document.getElementById('powerbar'));
	// var table = new google.visualization.Table(document.getElementById('powertable'));
	
	data.addColumn('number', 'Unknown');
	data.setCell(0, 1, 0);


	var updates = 0;
	var socket = io.connect("http://homemon.trease.eu:8500/");
	socket.emit("subscribe", { room: "power" });
	socket.on('data', function(message) { 
		
		var done = false; 
		for (var i = 0; i < data.getNumberOfColumns(); i++) {
			if (data.getColumnLabel(i) == message.name) {
				data.setCell(0, i, parseInt(message.value, 10));
				done = true;
				break;
			}
		}
		if (done == false) {
			data.addColumn('number', message.name);
			for (var i = 0; i < data.getNumberOfColumns(); i++) {
				if (data.getColumnLabel(i) == message.name) {
					data.setCell(0, i, parseInt(message.value, 10));
					break;
				}
			}
		}					
		chart.draw(data, options);
		
		var dt = new Date(); 
		document.getElementById("time").innerHTML= dt.toLocaleTimeString();
		document.getElementById("updates").innerHTML= ++updates;
	});
}
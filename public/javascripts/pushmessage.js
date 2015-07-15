	ElementExists = function(id) {
    		return !document.getElementById(id);
	}
		
	var updates = 0;

	var socket = io.connect("https://www.trease.eu:8500/pushmessage");
	socket.on('data', function(data) { 
		var table=document.getElementById("messagetable");
			
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = data.topic;
					
		// print the time the refresh happened
		var dt = new Date(); 
		document.getElementById("time").innerHTML = dt.toLocaleTimeString();
		document.getElementById("updates").innerHTML = ++updates;
	});

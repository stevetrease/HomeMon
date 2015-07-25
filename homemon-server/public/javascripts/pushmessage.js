ElementExists = function(id) {
		return !document.getElementById(id);
}
	
var updates = 0;

var socket = io.connect("http://www.trease.eu:8500");
socket.emit("subscribe", { room: "pushmessage" });
socket.on('data', function(data) { 
	var dt = new Date(); 
	var table=document.getElementById("messagetable");
		
	var row = table.insertRow(0);

	var cell = row.insertCell(0);
	cell.innerHTML = data.topic;
	var cell = row.insertCell(0);
	cell.style.width="15%";
	cell.innerHTML = dt.toLocaleTimeString();	
			
	// print the time the refresh happened
	document.getElementById("time").innerHTML = dt.toLocaleTimeString();
	document.getElementById("updates").innerHTML = ++updates;
});

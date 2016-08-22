ElementExists = function(id) {
	return !!document.getElementById(id);
};

function readablizeBytes(bytes) {
	var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
	var e = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
}




var updates = 0;

var socket = io.connect("http://homemon.trease.eu:8500/");
socket.emit("subscribe", { room: "snmpdata" });
socket.on('data', function(data) {
	// console.log("Message received " + data.message);
	var decodedData = JSON.parse (data.message);
	
	
	if (ElementExists (decodedData.device)) {
		// table exists
		// console.log ("table exists: " + decodedData.device);
		if (ElementExists (decodedData.device+"-"+decodedData.interface)) {
			// table-row exists
			// console.log ("interface exists: " + decodedData.interface);
			console.log ("updating " + decodedData.device+" "+decodedData.interface);
			cell = document.getElementById(decodedData.device+"-"+decodedData.interface);
			cell.innerHTML = data.message;
		} else {
			// table-tow does not exist - create it
			console.log ("creating interface: " + decodedData.interface);
			var tbl = document.getElementById(decodedData.device);
			var row = tbl.insertRow();
			row.id = decodedData.device+"-"+decodedData.interface;
			var cell = row.insertCell(0);
			cell.innerHTML = data.message;
		}
	} else {
		// no table, create one
		console.log ("creating table: " + decodedData.device);
		var tbl = document.createElement("TABLE");
		tbl.id = decodedData.device;
		document.getElementById("tables").appendChild(tbl);
	}

	// print the time the refresh happened
	var dt = new Date();
	document.getElementById("time").innerHTML= dt.toLocaleTimeString();
	document.getElementById("updates").innerHTML= ++updates;
});
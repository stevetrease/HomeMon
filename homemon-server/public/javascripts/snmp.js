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
	console.log("Message received " + data.message);
	var decodedData = JSON.parse (data.message);

	// print the time the refresh happened
	var dt = new Date();
	document.getElementById("time").innerHTML= dt.toLocaleTimeString();
	document.getElementById("updates").innerHTML= ++updates;
});
ElementExists = function(id) {
	return !!document.getElementById(id);
};

function readablizeBytes(bytes) {
	var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
	var e = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
}




var updates = 0;

var snmpHistory = {};

var socket = io.connect("http://homemon.trease.eu:8500/");
socket.emit("subscribe", { room: "snmpdata" });
socket.on('data', function(data) {
	// console.log("Message received " + data.message);
	var decodedData = JSON.parse (data.message);
	
	if (!ElementExists (decodedData.device+"-"+decodedData.interface)) {
		// device/interface element does not exist, so create it
		if (!ElementExists (decodedData.device)) {
			// create table
			console.log ("creating table: " + decodedData.device);
			var div2 = document.createElement("div");
			div2.className = "row well ";
			var title = document.createElement("h4");
			title.innerHTML = decodedData.device;
			var tbl = document.createElement("TABLE");
			tbl.className = "table";
			tbl.id = decodedData.device;

			document.getElementById("tables").appendChild(div2);
			div2.appendChild(title);
			div2.appendChild(tbl);
		}
		
		if (!ElementExists (decodedData.device+"-"+decodedData.interface)) {
			// create row
			// console.log ("creating interface: " + decodedData.interface);
			var tbl = document.getElementById(decodedData.device);
			var row = tbl.insertRow();
			row.id = decodedData.device+"-"+decodedData.interface;
			var cell = row.insertCell(0);
			cell.id = decodedData.device+"-"+decodedData.interface+"-ifInOctets";
			cell = row.insertCell(0);
			cell.id = decodedData.device+"-"+decodedData.interface+"-ifOutOctets";
			cell = row.insertCell(0);
			cell.id = decodedData.device+"-"+decodedData.interface+"-ifName";
			cell = row.insertCell(0);
			cell.id = decodedData.device+"-"+decodedData.interface+"-interface";
			
			var updateCell = document.getElementById(decodedData.device+"-"+decodedData.interface+"-interface");
			updateCell.innerHTML = decodedData.interface;

			updateCell = document.getElementById(decodedData.device+"-"+decodedData.interface+"-ifName");
			updateCell.innerHTML = decodedData.ifName;
			
			snmpHistory[decodedData.device+"-"+decodedData.interface] = decodedData;
		}
	} else {
		// update cells now we are sure they exist
		var updateCell = document.getElementById(decodedData.device+"-"+decodedData.interface+"-interface");
		updateCell.innerHTML = decodedData.interface;

		updateCell = document.getElementById(decodedData.device+"-"+decodedData.interface+"-ifName");
		updateCell.innerHTML = decodedData.ifName;

		updateCell = document.getElementById(decodedData.device+"-"+decodedData.interface+"-ifInOctets");
		var timeDelta = decodedData.timestamp - snmpHistory[decodedData.device+"-"+decodedData.interface].timestamp;
		var inBytes = decodedData.ifInOctets - snmpHistory[decodedData.device+"-"+decodedData.interface].ifInOctets;
		if (inBytes == 0) {
			updateCell.innerHTML = "";
		} else {
			updateCell.innerHTML = readablizeBytes(inBytes / timeDelta) + "/sec";
		}

		updateCell = document.getElementById(decodedData.device+"-"+decodedData.interface+"-ifOutOctets");
		timeDelta = decodedData.timestamp - snmpHistory[decodedData.device+"-"+decodedData.interface].timestamp;		
		var outBytes = decodedData.ifOutOctets - snmpHistory[decodedData.device+"-"+decodedData.interface].ifOutOctets;
		if (outBytes == 0) {
			updateCell.innerHTML = "";
		} else {
			updateCell.innerHTML = readablizeBytes(outBytes / timeDelta) + "/sec";
		}
	}

	// print the time the refresh happened
	var dt = new Date();
	document.getElementById("time").innerHTML= dt.toLocaleTimeString();
	document.getElementById("updates").innerHTML= ++updates;
});
ElementExists = function(id) {
		return !!document.getElementById(id);
};

// function to if a string starts with nother one
String.prototype.beginsWith = function (string) {
    return(this.indexOf(string) === 0);
};


var myvalues = [];
var updates = 0;


var socket = io.connect("http://www.trease.eu:8500");
socket.emit("subscribe", { room: "sensors" });
socket.on('data', function(data) { 
	// console.log("Message received " + data.topic + " of " + data.value);

	// check the target topic exisits & if not create a target table entry
	if (!ElementExists (data.topic)) {
		// console.log("Creating target " + data.topic);
		if (data.topic.beginsWith("sensors/power/")) {
			var table=document.getElementById("myTablePower");
		} else if (data.topic.beginsWith("sensors/boiler/")) {
			var table=document.getElementById("myTableTemp");
		} else if (data.topic.beginsWith("rate/sensors/snmp/router/")) {
			var table=document.getElementById("myRouterRate");
		} else if (data.topic.beginsWith("sensors/iosbattery/")) {
			var table=document.getElementById("myBattery");
		} else if (data.topic.beginsWith("sensors/temperature/")) {
			var table=document.getElementById("myTableTemp");
		} else if (data.topic.beginsWith("sensors/humidity/")) {
			var table=document.getElementById("myTableHumidity");
		} else if (data.topic.beginsWith("sensors/co/")) {
			var table=document.getElementById("myTableCO");
		} else if (data.topic.beginsWith("sensors/no2/")) {
			var table=document.getElementById("myTableNO2");
		} else if (data.topic.beginsWith("sensors/pressure/")) {
			var table=document.getElementById("myTablePressure");
		} else {
			console.log ("topic " + data.topic + " not known");
		}
		
		// itertate through table to find out where to insert row in alpha order
		var count = 1;
		for (i = 1; i < table.rows.length; i++) {
			var row = table.rows[i];
			var col = row.cells[0];
			if (col.firstChild.nodeValue < data.topic.slice(data.topic.lastIndexOf('/')+1)) {
				count++;
			}
		} 

		var row=table.insertRow(count);
		var cell=row.insertCell(0);
		cell.id = data.topic;
		var cell=row.insertCell(0);
		cell.id = data.topic + "name";
		
		document.getElementById(data.topic).style.textAlign="right";
		document.getElementById(data.topic).style.width="25%";
		if(data.name != undefined) {  // label cell based on emitted friendly name
			document.getElementById(data.topic + "name").innerHTML = data.name;
		} else { // label ce;; based on topic name
			document.getElementById(data.topic + "name").innerHTML = data.topic.slice(data.topic.lastIndexOf('/')+1);
		}
		document.getElementById(data.topic + "name").style.textAlign="left";
		document.getElementById(data.topic + "name").style.width="75%";
	}
	// new we know there is a target, update it
	// console.log("Setting target " + data.topic + " to " + data.value);
	
	if (ElementExists (data.topic)) {
		document.getElementById(data.topic).innerHTML= data.value;
	}
	
	// print the time the refresh happened
	var dt = new Date(); 
	document.getElementById("time").innerHTML= dt.toLocaleTimeString();
	document.getElementById("updates").innerHTML= ++updates;
});
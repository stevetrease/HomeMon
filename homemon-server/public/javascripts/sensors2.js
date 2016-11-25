ElementExists = function(id) {
		return !!document.getElementById(id);
};

// function to if a string starts with nother one
String.prototype.beginsWith = function (string) {
	return(this.indexOf(string) === 0);
};


var updates = 0;


var socket = io.connect("http://homemon.trease.eu:8500");
socket.emit("subscribe", { room: "sensors2" });
socket.on("data", function(data) { 
	// console.log("Message received " + data.topic + " of " + data.value);


	// check the target topic exisits & if not create a target table entry
	if (!ElementExists (data.topic)) {
		var table=document.getElementById("myTable").getElementsByTagName("tbody")[0];

		// var row=table.insertRow(count);
		device = data.topic.substring(data.topic.lastIndexOf("/")+1);
		console.log("creating new row for " + device + " as " + data.name);

		var row=table.insertRow(table.rows.length);

		var cell=row.insertCell(0);
		cell.id = "sensors/co2/" + device;

		cell=row.insertCell(0);
		cell.id = "sensors/co/" + device;

		cell=row.insertCell(0);
		cell.id = "sensors/no2/" + device;

		cell=row.insertCell(0);
		cell.id = "sensors/pressure/" + device;

		cell=row.insertCell(0);
		cell.id = "sensors/humidity/" + device;

		cell=row.insertCell(0);
		cell.id = "sensors/temperature/" + device;

		cell=row.insertCell(0);
		cell.id = device + "name";


		if(data.name != undefined) {  // label cell based on emitted friendly name
			document.getElementById(device + "name").innerHTML = data.name;
		} else { // label ce;; based on topic name
			document.getElementById(device + "name").innerHTML = data.topic.slice(data.topic.lastIndexOf("/")+1);
		}
	}

	if (ElementExists (data.topic)) {
		document.getElementById(data.topic).style.textAlign="center";
		document.getElementById(data.topic).innerHTML= data.value;
	}

	// print the time the refresh happened
	var dt = new Date();
	document.getElementById("time").innerHTML= dt.toLocaleTimeString();
	document.getElementById("updates").innerHTML= ++updates;
});
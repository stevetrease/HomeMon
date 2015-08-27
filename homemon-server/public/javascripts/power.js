ElementExists = function(id) {
		return !!document.getElementById(id);
};
BeginsWith = function(needle, haystack) {
	return (haystack.substr(0, needle.length) == needle);
}

var myvalues = [];
var updates = 0;

var socket = io.connect("http://homemon.trease.eu:8500/");
socket.emit("subscribe", { room: "power" });
socket.emit("subscribe", { room: "power_cumulative" });
socket.on('data', function(data) { 
	// console.log("Message received " + data.topic + " of " + data.value);

	// check the target topic exisits & if not create a target table entry
	if (!ElementExists (data.topic)) {
		var topictag = "cumulative/";
		if (!(data.topic.substring(0,topictag.length) == topictag)) {
			// console.log("Creating target " + data.topic);

			var table=document.getElementById("myTablePower");

			// itertate through table to find out where to insert row in alpha order
			var count = 3;
			for (i = 3; i < table.rows.length; i++) {
				var row = table.rows[i];
				var col = row.cells[0];
				if (col.firstChild.nodeValue < data.topic.slice(data.topic.lastIndexOf('/')+1)) {
					count++;
				}
			} 

			var row=table.insertRow(count);
			var cell=row.insertCell(0);
			cell.id = "cumulative/daily/" + data.topic;
			var cell=row.insertCell(0);
			cell.id = "cumulative/hour/" + data.topic;
			var cell=row.insertCell(0);
			cell.id = data.topic;
			var cell=row.insertCell(0);
			cell.id = data.topic + "name";
			
			document.getElementById(data.topic).style.textAlign="center";
			document.getElementById("cumulative/hour/" + data.topic).style.textAlign="center";
			document.getElementById("cumulative/daily/" + data.topic).style.textAlign="center";

			if(data.name != undefined) {  // label cell based on emitted friendly name
				document.getElementById(data.topic + "name").innerHTML = data.name;
			} else { // label cell based on topic name
				document.getElementById(data.topic + "name").innerHTML = data.topic.slice(data.topic.lastIndexOf('/')+1);
			}
		}
	}
	
	if (ElementExists (data.topic)) {
		// console.log("Setting target " + data.topic + " to " + data.value);
		document.getElementById(data.topic).innerHTML= data.value;
	// } else {
	// 		console.log("Target " + data.topic + " does not exit");		
	}

	
	// print the time the refresh happened
	var dt = new Date(); 
	document.getElementById("time").innerHTML= dt.toLocaleTimeString();
	document.getElementById("updates").innerHTML= ++updates;
});

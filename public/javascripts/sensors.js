	ElementExists = function(id) {
    		return !!document.getElementById(id);
	};
	BeginsWith = function(needle, haystack) {
		return (haystack.substr(0, needle.length) == needle);
	}

	var myvalues = [];
	var updates = 0;
    

	var socket = io.connect("http://silver.trease.eu:3000/sensors");
	socket.on('data', function(data) { 
		// console.log("Message received " + data.topic + " of " + data.value);

		// check the target topic exisits & if not create a target table entry
		if (!ElementExists (data.topic)) {
			// console.log("Creating target " + data.topic);
			var topictag = "sensors/power/";
			if (data.topic.substring(0,topictag.length) == topictag) {
				var table=document.getElementById("myTablePower");
			}
			var topictag = "sensors/temperature/";
			if (data.topic.substring(0,topictag.length) == topictag) {
				var table=document.getElementById("myTableTemp");
			}
			var topictag = "sensors/humidity/";
			if (data.topic.substring(0,topictag.length) == topictag) {
				var table=document.getElementById("myTableHumidity");
			}
			var topictag = "sensors/co/";
			if (data.topic.substring(0,topictag.length) == topictag) {
				var table=document.getElementById("myTableCO");
			}
			var topictag = "sensors/no2/";
			if (data.topic.substring(0,topictag.length) == topictag) {
				var table=document.getElementById("myTableNO2");
			}
			var topictag = "sensors/pressure/";
			if (data.topic.substring(0,topictag.length) == topictag) {
				var table=document.getElementById("myTablePressure");
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
		document.getElementById(data.topic).innerHTML= data.value;

		
		// print the time the refresh happened
		var dt = new Date(); 
		document.getElementById("time").innerHTML= dt.toLocaleTimeString();
		document.getElementById("updates").innerHTML= ++updates;
	});

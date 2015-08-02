ElementExists = function(id) {
                return !!document.getElementById(id);
};

function readablizeBytes(bytes) {
    var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
}




var updates = 0;

var socket = io.connect("http://www.trease.eu:8500/");
socket.emit("subscribe", { room: "snmp" });
socket.on('data', function(data) {
        // console.log("Message received " + data.message);
        var decodedData = JSON.parse (data.message);
        
        // does a table row exist for the device & interface
        if (!ElementExists(decodedData.device + "-" + decodedData.interface)) {
        
	        // does a table exist for the device
	 		if (!ElementExists(decodedData.device)) {
		 		// create the table
		 		console.log ("creating table for " + decodedData.device);
		 		
		 		var div = document.createElement ('div');
		 		div.className += div.className ? ' well well-sm' : 'well well-sm';
		 		 
		 		var h = document.createElement('h3');
		 		h.innerHTML = decodedData.device;
		 		h.className += h.className ? ' text-center' : 'text-center';
		 		div.appendChild (h);
		 		
		 		var t = document.createElement('table');
		 		t.id = decodedData.device;
		 		t.style.width = "100%";
		 		t.className += t.className ? ' table-striped table-condensed table-bordered' : 'table-striped table-condensed table-bordered';
		 		div.appendChild (t);
		 		
		 		document.getElementById("tables").appendChild (div);
	 		} 
	 		
	 		// create the row
	 		// console.log ("creating row for " + decodedData.device + " " + decodedData.interface);
	 		var c, r, t;
	 		
	 		t = document.getElementById(decodedData.device);
	 		r = t.insertRow (0);
	 		r.id = decodedData.device + "-" + decodedData.interface;
	 		
	 		c = r.insertCell (0);
		 	c.id = decodedData.device + "-" + decodedData.interface + "-out";
		 	c.style.width = "20%";
		 	c.style.textAlign="right";
		 	c.innerHTML = readablizeBytes(parseInt(decodedData.out));
		 	
		 	c = r.insertCell (0);
		 	c.id = decodedData.device + "-" + decodedData.interface + "-in";
		 	c.style.width = "20%";
		 	c.style.textAlign="right";
		 	c.innerHTML = readablizeBytes(parseInt(decodedData.in));

		 	c = r.insertCell (0);
		 	c.id = decodedData.device + "-" + decodedData.interface + "-description";
		 	c.style.width = "50%";
		 	c.innerHTML = decodedData.description;	
		 	
		 	c = r.insertCell (0);
		 	c.id = decodedData.device + "-" + decodedData.interface + "-interface";
		 	c.style.width = "10%";
		 	c.style.textAlign="center";
		 	c.innerHTML = decodedData.interface;

 		}
 		
 		// since the row exists, update it
 		// console.log("updating " + decodedData.device + " " + decodedData.interface);
        var cell = document.getElementById(decodedData.device + "-" + decodedData.interface + "-out");
        cell.innerHTML = readablizeBytes(parseInt(decodedData.out));
 		cell = document.getElementById(decodedData.device + "-" + decodedData.interface + "-in");
        cell.innerHTML = readablizeBytes(parseInt(decodedData.in));       
        
        
        // print the time the refresh happened
        var dt = new Date();
        document.getElementById("time").innerHTML= dt.toLocaleTimeString();
        document.getElementById("updates").innerHTML= ++updates;
});

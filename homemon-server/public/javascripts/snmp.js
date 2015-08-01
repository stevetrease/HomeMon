ElementExists = function(id) {
                return !!document.getElementById(id);
};

var updates = 0;

var socket = io.connect("http://www.trease.eu:8500/");
socket.emit("subscribe", { room: "snmp" });
socket.on('data', function(data) {
        console.log("Message received " + data.message);

        // print the time the refresh happened
        var dt = new Date();
        document.getElementById("time").innerHTML= dt.toLocaleTimeString();
        document.getElementById("updates").innerHTML= ++updates;
});

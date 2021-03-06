ElementExists = function(id) {
                return !!document.getElementById(id);
};

var updates = 0;

var socket = io.connect("http://homemon.trease.eu:8500/");
socket.emit("subscribe", { room: myPath });
socket.on('data', function(data) {
        console.log("Message received " + data.topic + " of " + data.value);

        // check the target topic exisits & if not create a target table entry
        if (!ElementExists (data.topic)) {
                // console.log("Creating target " + data.topic);
                var table=document.getElementById("messagetable").getElementsByTagName('tbody')[0];


                // itertate through table to find out where to insert row in alpha order
                var count = 1;
                if (document.getElementById("messagetable").rows.length !== 1) {
                        for (i = 1; i < document.getElementById("messagetable").rows.length; i++) {
                                var row = table.rows[i];
                                var col = row.cells[0];
                                if (col.firstChild.nodeValue < data.topic) {
                                        count++;
                                }
                        }
                }

                var row=table.insertRow(count);
                var cell=row.insertCell(0);
                cell.id = data.topic;
                cell=row.insertCell(0);
                cell.id = data.topic + "name";
                document.getElementById(data.topic).style.textAlign="right"
                document.getElementById(data.topic).style.wordWrap="normal"
                document.getElementById(data.topic + "name").innerHTML= data.topic;
        }
        // new we know there is a target, update it
        // console.log("Setting target " + data.topic + " to " + data.value);
        document.getElementById(data.topic).innerHTML= data.value;

        // print the time the refresh happened
        var dt = new Date();
        document.getElementById("time").innerHTML= dt.toLocaleTimeString();
        document.getElementById("updates").innerHTML= ++updates;
});

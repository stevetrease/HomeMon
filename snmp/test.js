
function snmp_data () {
	this.a = null;
	this.b = null;	
}

var test = [];



var item = new snmp_data();
item.a = 1;
item.b = 1;
test.push(item);
var item = new snmp_data();
item.a = 1;
item.b = 1;
test.push(item);
var item = new snmp_data();
item.a = 1;
item.b = 1;
test.push(item);



for (var key in test) {
	
	console.log(key, test[0].a, test[0].b);
}
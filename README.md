# .b

Tiny one-way data binding binding library.
First of all let's create some data:

var devices = []; // create array where all devices are stored

var device = function(parameters){
	obj = this; // get instance
	for(var key in parameters){ // loop attributes
		obj[ key ] = parameters[ key ]; // set attribute
	}
	
	obj.id = devices.length;
	devices.push(obj);
};
	
// create the devices
var device1 = new device({alias : "Device 1", status : "ok"});
var device2 = new device({alias : "Device 2", status : "unknown"});
var device3 = new device({alias : "Device 3", status : "error"});
    

Usage with jQuery:
var el = $("<div>").b({class : "dev.status", html : "dev.alias"},{dev : device1}).appendTo("body");

Usage without jQuery:

Usage with template:

var template = b.template();


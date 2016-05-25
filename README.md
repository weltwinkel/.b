# .b


Tiny one-way data binding binding library.
Developed for a client application that periodically polls for changes of many devices. The models are created when first loading the application.

## basic usage

A typical device model may look like this:

```
var device = function(parameters){
	obj = this; // get instance
	for(var key in parameters){ // loop attributes
		obj[ key ] = parameters[ key ]; // set attribute
	}
};
```

let's now create two devices and store them in an array:

```
var devices = [];
devices.push( new device({alias : "Device 1", status : "ok"}) ); // create device and add it to array
devices.push( new device({alias : "Device 2", status : "warning"}) ); // create device and add it to array
```

now these devices will be displayed on a site. Some attributes such as "status" are known to be variabel and change overtime.
Other attributes such as "alias" remain unchanged. When displaying the devices the variable attributes of the model can be bound to the renders HTML
so that the HTML can be updated any time the model changes.

Let's use jQuery to render both devices:

```
devices.forEach(function(device){
	
	var row = $("<div>").appendTo("body");
		$("<span>").b({class : "d.status", html : "d.status"},{d : device}).appendTo( row );
		$("<span>").html( device.alias ).appendTo( row );
	});	
```

In doing this, two binders are created per object. These are stored in the ._binders : [] key of each device.
A ._set(key, val) method is added as well. Should "Device 1" be updated, following code can be used:

```
try{ 
	devices[0]._set("status","error");
}catch(e){
	devices[0].status = "error";
}
```

If binders are found, they are executed by the ._set method. In the previous case this would lead to the class attribute and html of the first element in the first row to be updated.
The example shows the use of the binders 'class' and 'html', the following are supplied as well:

- html
- class
- bgCol
- style (needs paramter e.g.: style="dev.status|backgroundColor:formatter1", formatter is optional)

Additional binders can be added when needed.

## using formatters

When displaying values, formatter functions may be used in order to format date or react to specific paramters

```
devices.forEach(function(device){
	
	var row = $("<div>").appendTo("body");
		$("<span>").b({class : "d.status", html : "d.status:formatter1"},{d : device}).appendTo( row );
		$("<span>").html( device.alias ).appendTo( row );
	});	
```
	
The "status" paramter of the device is now passed through a formatter function before being displayed as HTML. A formatter is constructed the following way:

```
formatter1 : function(params){
	
	var obj = params[0].object;
	var param_name = params[0].param;
	var val = obj[ param_name ];
	
	var stat = "??"; // default
	if(val == "ok"){
		stat = ":)";
	}else if(val == "error"){
		stat = "error";
	}
	
	params.formatted = stat; // add formatted value
	
	return params; // return object
}
```

The formatter will now display "??" as a default value, for status = "ok" it will return ":)" and for status = "error" it will remain "error"

## using templates

In order to avoid memory leaks when displaying new data on the same page, binders can be associated with templates.
These can be unbound as soon as a new dataset is to be displayed.

```
var template = b.template(); // creates a new template

devices.forEach(function(device){
	
	var row = $("<div>").appendTo("body");
		$("<span>").b({class : "d.status", html : "d.status"},{d : device}, template).appendTo( row );
		$("<span>").html( device.alias ).appendTo( row );
	});	
```
	
When leaving the page, all binders associated with the template can be unbound using template.unbind();
The following methods are supported for templates:

- template.unbind()
- template.remove()
- b.unbindAll() // unbinds and removes all templates


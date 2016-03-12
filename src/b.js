(function() {
	
	//////////////////////////////////////////////////////////////////////////
	/// settings /////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b = {
		version : "0.1",
		author 	: "Krispin Weiss",
		templates : [], // <- all templates are stored here!
		method_devider : "|" // e.g.: param1:text | param2:class
	};
	
	//////////////////////////////////////////////////////////////////////////
	/// define formatters ////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b.formatters = {

		// CUSTOM FORMATTERS /////////////////////////////////////////////////
		
		// Circuit state (0: IDLE, 1: PRECHECK, 2: MAKE, 3: VERIFY, 4: BREAK, 5: WAITRESOURCES, 6: UNKNOWN)
		cirSet : function(params){
			
			var stat;
			switch(params[0].object[ params[0].param ]){
				case "0": stat = "idle"; break;
				case "1": stat = "precheck"; break;
				case "2": stat = "make"; break;
				case "3": stat = "verify"; break;
				case "4": stat = "break"; break;
				case "5": stat = "waitRes."; break;
				case "6": stat = "unknown"; break;
			}
			
			params.formatted = stat; // add formatted value
			return params; // return object
		},
		
		// LED
		LED : function(params){
			
			var col; // color
			switch(params[0].object[ params[0].param ]){
				case "1": col = "#ccc"; break;
				case "2": col = "red"; break;
				case "3": col = "yellow"; break;
				case "4": col = "#60E065"; break;
				case "5": col = "orange"; break;
				case "8": col = "blue"; break;
				default : col = "#ccc";
			} 
			params.formatted = "<span style='width:16px; height:16px; background:" + col + "; display:block; border-radius:8px;'></span>";
			return params;
			
		},
		
		// format timestamp
		ts : function(params){
			
			var timestamp = params[0].object[ params[0].param ];
			var date = new Date(timestamp);
			
			if(new Date(timestamp).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)){
				// today (ommit date)
				params.formatted = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
			}else{
				// not today
				params.formatted = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " on " + date.getUTCDate() + "." + (date.getMonth() + 1);
			}
			return params; // return object
		},
		
		// DEFAULT FORMATTER /////////////////////////////////////////////////
		default : function(params){
			return params; // return object without change
		}
	};
	
	//////////////////////////////////////////////////////////////////////////
	/// define binders ///////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b.binders = {
		// CUSTOM BINDERS ////////////////////////////////////////////////////

		
		// DEFAULT BINDERS ///////////////////////////////////////////////////
		// set text
		html : function(el,params){
			if(typeof params.formatted !== "undefined"){
				el.innerHTML = params.formatted; // set formatted value
			}else{
				el.innerHTML = params[0].object[ params[0].param ]; // set raw value
			}
		},
		
		// set class
		class : function(el,params){
			if(typeof params.formatted !== "undefined"){
				el.setAttribute("class", params.formatted); // set formatted value
			}else{
				el.setAttribute("class", params[0].object[ params[0].param ]); // set raw value
			}
		}
	};
	

	
	//////////////////////////////////////////////////////////////////////////
	/// main /////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b.add_setter = function(object){
		
		if(typeof object._set != "function"){ 
			// add binders property
			object._binders = [];
		
			// add setter to object
			object._set = function(param,value){
				var obj = this;
				
				if(obj[ param ] != value && typeof obj._binders[ param ] != "undefined"){
					// value was updated & binder(s) are registered
					obj[ param ] = value;
					//console.log("value was updated!");
					try{ 
						obj._binders[ param ].forEach(function(fn){ 
							try{ // execute formatter
								var formatted = b.formatters[ fn.formatter ](fn.params);
							}catch(e){
								console.warn("problem in formatter:", fn.formatter );
								var formatted = fn.params; // pass to fn without formatting
							}
							
							try{ // execute fn
								b.binders[ fn.fn ](fn.el, formatted );
							}catch(e){
								console.warn("problem in method:", fn.fn );
							}
						}); 
					}catch(e){
						console.log(e); // error
					}
				}
				
				return obj; // return instance
			};
		}
	};
	
	// parse {'mod.status|i'},{ mod : mod, id } => [{ object : mod, param : status},{ object : i, param : undefined}]
	b.parseVars = function(parameters, model){
		
		var params = [];
		
		// parameters e.g: 'mods[i].html|i:formatter'
				
		// remove formatter (if specified) & split vars
		parameters.split(":")[0].split("|").forEach(function(p){
			
			if(p.split("[").length > 1){ 
				// array -> get index
				
				var index = p.split("[")[1].split("]")[0];
				if(isNaN(index)){ // e.g.: mods[ i ].id:id
					if(typeof model[index] === "number"){
						index = model[index];
					}else{
						console.warn("could not resolve index",index);
					}
				}else{ // index is a number
					index = parseInt(index);
				}
				
				var array = eval(p.split("[")[0]);
				var param = p.split(".")[1];

				var object = array[ index ];
				
			}else{ // plain old object
				if(typeof model[ p ] != "undefined"){ // e.g.: { id : 'i'},{ i : i}
					// variable from model, e.g: i
					var object = model[ p ];
					var param = undefined;
				}else if(model[p.split(".")[0]]){ // in model! e.g: { id : 'mod.id'},{ mod : mod }
					
					var object = model[p.split(".")[0]]; // object in model
					var param = p.split(".")[1]; // get parameter name
				}else{
					// not in model
					try{
						var object = eval(p.split(".")[0]);
						var param = p.split(".")[1]; // object is undefined if parameter is number,string etc...
					}catch(e){
						// whatever it is, use as string...
						var object = p;
						var param = undefined;
					}
				}
			}
				
			params.push({ object : object, param : param});
		});
		
		return params;
	};
		
	b.bind = function(el,bound_attr, model){
		
		template = this; // get template instance


		// parse BOUND functions {fn1 : param(s), fn2 : param(s)}
		for(var fn in bound_attr) {
			
			var params = b.parseVars(bound_attr[fn], model); // returns [{ object : obj1, param : p1}, { object : obj2, param : p2}...]

			// check for formatter
			var formatter = 'default'; // default
			if(bound_attr[fn].split(":").length > 1){
				formatter = bound_attr[fn].split(":")[1];
			}
		
			// loop parameters
			params.forEach(function(param){
				if(typeof param.object == "object"){
					
					// add setter to object (only if typeof == object)
					b.add_setter(param.object);
				
					if(typeof param.object._binders[ param.param ] == "undefined"){
						// no binders yet...
						param.object._binders[ param.param ] = []; // set default
						}

					// add current binder
					param.object._binders[ param.param ].push({
						el : el,
						fn : fn,
						formatter : formatter,
						params : params,
						template : template.id
						});
					}
					
					// TEMPLATE
					// save binder in template (obj.binders[ object.id ])
					if(typeof param.object.id == "undefined"){
						//console.warn("no id attribute defined in: ",param);
					}else{
						if(typeof template._binders[ param.object.id ] == "undefined"){ // object must have unique id attribute!
							// no binders yet...
							template._binders[ param.object.id ] = []; // set default
							}
					
						// no binders for this param yet (obj.binders[ object.id ][ paramName ])
						if(typeof template._binders[ param.object.id ][ param.param ] == "undefined"){ // no binders yet...
							template._binders[ param.object.id ][ param.param ] = param.object; // set default
							}
					}
				});
		
			// execute binder
			try{ // execute formatter
				var formatted = b.formatters[ formatter ](params);
			}catch(e){
				console.warn("problem in formatter:", formatter);
				var formatted = params; // pass to fn without formatting
			}
				
			try{ // execute fn
				b.binders[ fn ]( el, formatted );
			}catch(e){ // catch error
				console.warn("problem in method:", fn);
			}
			
			//binders.push({fn : fn, params : params});
			}	
	};
	
	
	b.unbindAll = function(){
		
		// loop templates
		var i = b.templates.length;
		while(i--){
			b.templates[i].unbind(); // unbind it
			if(i != 0) b.templates.splice(i,1); // remove it (if not default template)
		}

	};
	
	
	//////////////////////////////////////////////////////////////////////////
	/// define template //////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b.template = function(name){
		
		var obj = this; // get instance
		
		// settings
		if(typeof name != "undefined") obj.name = name; // set name (if specified)
		
		obj._binders = [];
		obj.id = b.templates.length;
		obj.type = "template"; // used to identify object as template
		
		// methods
		obj.bind = b.bind;
		obj.unbind = b.template.unbind; // undbind & reset template
		obj.remove = b.template.remove; // unbind & delete template
		obj.div = b.template.div; // creates <div> using template.div({ attributes })
		obj.appendTo = b.template.appendTo; // appends created <div> to other element
		obj.html = b.template.html; // set content of created <div>
		
		b.templates.push( obj ); // add to array
	};
	
	// undbind & reset template
	b.template.unbind = function(){
		
		var temp = this; // get instance
		
		// loop object id's
		for(var id in temp._binders){ // id = id attribute of object!
			
			// loop attributes
			for(var param in temp._binders[ id ]){ // param = parameter of object
		
				// loop binders for param
				var i = temp._binders[ id ][ param ]._binders[ param ].length;
				while(i--){
					if(temp._binders[ id ][ param ]._binders[ param ][ i ].template == temp.id){ // remove only binders mathing current template
						temp._binders[ id ][ param ]._binders[ param ].splice(i,1);
						}
				}
			}
		}
		
		// reset template
		temp._binders = [];
		return temp; // return resetted template
		
	};
	
	// unbind & delete template
	b.template.remove = function(){
			
		var temp = this; // get instance
		
		// loop object id's
		for(var id in temp._binders){
			// loop attributes
			for(var param in temp._binders[ id ]){

				// loop binders for param
				temp._binders[ id ][ param ]._binders[ param ].forEach(function(b,i){
					if(b.template == temp.id){ // remove only binders mathing current template
						temp._binders[ id ][ param ]._binders[ param ].splice(i,1);
						}
					});
			}
		}
		
		// don't remove b.templates[0] (default template)
		if(temp.id == 0){
			temp._binders = []; // reset default template
		}else{

			// get current template index in b.templates[]
			b.templates.forEach(function(t,i){
				if(t.id == temp.id){ // -> remove it!
					b.templates.splice( i,1); // remove template
				}
			});
			
			// loop template attributes and remove them
			for(var param in temp){
				delete temp[ param ]; // remove attribute
			}
		}
		
	};
	
	// create <div> e.g: template.div({id : "foo"},{html : 'mod.html'},{mod : mod}).appendTo("#test");
	b.template.div = function(static_attr,bound_attr,model){
		
		var obj = this; // get instance
		obj.el = document.createElement("div");
			
		if(arguments.length < 3){
			// not all arguments were specified
			model = bound_attr; // model : assumed to be last arguement
			bound_attr = static_attr; // binders : assumed to be first argument
		}else{
			// all arguments were set -> set STATIC attributes
			for(var key in static_attr) {
				obj.el.setAttribute(key, static_attr[key]);
			}
		}
				
		// call binding method
		obj.bind(obj.el,bound_attr,model);

		return obj; // return object
	};
	
	// set content of created <div>
	b.template.html = function(content){
		this.el.innerHTML = content;
		return this; // return template
	},
	
	// appendTo
	b.template.appendTo = function(selector){
		
		
        var obj = this; // get instance
        if(typeof selector === "object"){
            $( selector ).append( obj.el );
        }else{
                // append object directly to DOM
                document.querySelector( selector ).appendChild( obj.el );
        }
        return this;
	}
	
	// create default template (for all binders where no template is specified)
	new b.template("default template");

	
	// Expose b to the global object
	window.b = b;
}).call(this);


(function() {
	
	//////////////////////////////////////////////////////////////////////////
	/// settings /////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b = {
		version : "0.1.1",
		author 	: "Krispin Weiss",
		templates : [], // <- all templates are stored here!
		param_devider : "|" // e.g.: { html : "mod.time|mod.date"},{ mod : mod }
	};
	
	//////////////////////////////////////////////////////////////////////////
	/// define formatters ////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b.formatters = {
		// DEFAULT FORMATTER /////////////////////////////////////////////////
		default : function(params){
			return params; // return object without change
		}
	};
	
	
	//////////////////////////////////////////////////////////////////////////
	/// main /////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	b.add_setter = function(object){
		
		if(typeof object._set != "function"){ 
			// add binders object
			object._binders = {};
		
			// add setter to object
			object._set = function(param,value){
				
				var obj = this; // get instance of current object
				
				if(obj[ param ] != value){ // value was updated
					
					obj[ param ] = value; // update value

					if(typeof obj._binders[ param ] === "object"){ // binders are registered! -> execute them

						try{ 
							obj._binders[ param ].forEach(function(fn){ 
								try{ // execute formatter
									var formatted = b.formatters[ fn.formatter ]( fn.params );
								}catch(e){
									console.warn("problem in formatter:", fn.formatter, e );
									var formatted = fn.params; // pass to fn without change
								}
								
								try{ // execute fn
									b.binders[ fn.fn ]( fn.el, formatted );
								}catch(e){
									console.warn("problem in method:", fn.fn, e );
								}
							}); 
						}catch(e){
							console.log(e); // error
						}
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
		parameters.split( b.param_devider ).forEach(function(p){
			
			// e.g.: ${physical-interface}:ethernet-mac-statistics:input-crc-errors:stdErr
			if(typeof b.formatters[ p.split(":").pop() ] == "function"){ // is formatter
				//p = p.split(":").splice( (p.split(":").length-1), 1).join("");
				var tmp = p.split(":");
				tmp.splice(-1,1); // remove last segment (formatter)
				p = tmp.join(":"); // join segments again
			}
	
			// assume plain old object
			if(typeof model[ p ] != "undefined"){ // e.g.: { id : 'i'},{ i : i}
				// variable from model, e.g: i
				var object = model[ p ];
				var param = undefined;
			}else if(Array.isArray(model[ p.split(".")[0] ]) == true){ // Array of objects!
				
				// loop array
				model[ p.split(".")[0] ].forEach(function(object){
					if(typeof object == "object"){
						params.push({ object : object, param : p.split(".")[1]});
					}
				});
				
			}else if(model[p.split(".")[0]]){ // in model! e.g: { id : 'mod.id'},{ mod : mod }
		
				var object = model[p.split(".")[0]]; // object in model
				var param = p.split(".").slice(1).join('.'); // get parameter name
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
			
				
			if(typeof object !== "undefined") params.push({ object : object, param : param});
			
		});
		
		return params;
	};
		
	b.b = function(el, bound_attr, model){
		
		template = this; // get template instance


		// parse BOUND functions {fn1 : param(s), fn2 : param(s)}
		for(var fn in bound_attr) {
			
			var params = b.parseVars(bound_attr[fn], model); // returns [{ object : obj1, param : p1}, { object : obj2, param : p2}...]

			// check for formatter
			var formatter = 'default'; // default
			if(bound_attr[fn].split(":").length > 1){
				formatter = bound_attr[fn].split(":").pop();
			}
		
			// loop parameters
			params.forEach(function(param){
				if(typeof param.object === "object" && !Array.isArray(param.object)){
					
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
					// save binder in template (obj._binders[ object.id ])
					template._binders.push({
						object : param.object,
						param : param.param
					});
				});
		
			// execute binder
			try{ // execute formatter
				var formatted = b.formatters[ formatter ](params);
			}catch(e){
				console.warn("problem in formatter:", formatter, params);
				var formatted = params; // pass to fn without formatting
			}
				
			try{ // execute fn
				b.binders[ fn ]( el, formatted );
			}catch(e){ // catch error
				console.warn("problem in method:", fn, params);
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
		
		// get max id of templates
		var id = 0;
		b.templates.forEach(function(temp){
			if(temp.id > id) id = temp.id;
		});
		
		obj.id = id + 1; // set templates id to max id + 1
		obj.type = "template"; // used to identify object as template
		
		// methods
		obj.b = b.b;
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
		
		var param,binder;
		for(var z = (temp._binders.length-1); z >= 0; z--){
			binder = temp._binders[ z ]; // binder: { object : object, param : param }
			// loop binders in object._binders[ param ]
			
			if(typeof binder.object._binders === "undefined"){ // parameter is not an object...
				temp._binders.splice(z,1); // remove array, string, int...
				continue; // -> next binder
				}
			
			for(var i = (binder.object._binders[ binder.param ].length-1); i >= 0; i--){
				param = temp._binders[ z ].object._binders[ binder.param ][ i ];
				if(param.template == temp.id){ // binder belongs to current template -> delete!
					binder.object._binders[ binder.param ].splice(i,1);
				}
			}
			temp._binders.splice(z,1); // delete binder from template
		}
		
		// reset template
		return temp; // return resetted template
		
	};
	
	// unbind & delete template
	b.template.remove = function(){
			
		var temp = this; // get instance
		
		// unbind all binders in template
		temp.unbind();
		
		// don't remove b.templates[0] (default template)
		if(temp.id == 0){
			temp._binders = []; // reset default template
		}else{

			// get current template index in b.templates[]
			for(var i = (b.templates.length-1); i >= 0; i--){
				if(b.templates[ i ].id == temp.id){ // -> remove it!
					b.templates.splice(i,1); // remove template
				}
			}
			
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
		obj.b(obj.el,bound_attr,model);

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


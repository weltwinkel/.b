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
	},
	
	// set background color
	bgcolor : function(el,params){
		
		if(typeof params.formatted !== "undefined"){
			el.style.backgroundColor = params.formatted; // set formatted value
		}else{
			el.style.backgroundColor = params[0].object[ params[0].param ]; // set raw value
		}
	},
	

	/// SVG //////////////////////////////////////////////////////////////
	// set element bgColor
	fill : function(el,params){
		
		if(typeof params.formatted !== "undefined"){
			el.style.backgroundColor = params.formatted; // set formatted value
		}else{
			el.style.fill = params[0].object[ params[0].param ]; // set raw value
		}
	},
	
	// set element opacity
	opacity : function(el,params){

		if(typeof params.formatted !== "undefined"){
	
			el.style.fillOpacity = params.formatted; // set formatted value
		}else{
			el.style.fillOpacity = params[0].object[ params[0].param ]; // set raw value
		}
	}
};
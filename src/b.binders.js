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
	}
};
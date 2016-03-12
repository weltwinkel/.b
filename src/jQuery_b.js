$.fn.extend({
  b : function(parameters,model,template) {
	var el = this;
	
	if(typeof template == "undefined"){
		// select default template
		b.templates[0].bind( el[0], parameters, model);
	}else{
		if(model.type == "template"){
			// model and template were switched...
			model.bind( el[0], parameters, template);
		}else{
			template.bind( el[0], parameters, model);
		}
	}
	
	return el;
  }
});
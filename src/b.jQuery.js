$.fn.extend({
  b : function(parameters,model,template) {
	var el = this;
	if(typeof template == "undefined"){
            // select default template
            b.templates[0].b( el[0], parameters, model);
	}else{
            // use specified template
            template.b( el[0], parameters, model);
	}
    return el;
    }
});

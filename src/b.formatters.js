b.formatters = {
    
    // CUSTOM FORMATTERS /////////////////////////////////////////////////
    stdErr : function(params){
		
        var stat;
        switch(params[0].object[ params[0].param ]){
                case "0": stat = "OK"; break;
                case "1": stat = "GuessOk"; break;
                case "2": stat = "Unknown"; break;
                case "3": stat = "Warning"; break;
                case "4": stat = "Minor"; break;
                case "5": stat = "Major"; break;
                case "6": stat = "Critical"; break;
        }

        params.formatted = stat; // add formatted value
		
        return params; // return object
    },

    // return std Error color
    stdErrCol : function(params){
        var col;
        switch(params[0].object[ params[0].param ]){
                case "0": col = "#d1ee63"; break;
                case "1": col = "#eeffaa"; break;
                case "2": col = "#f2f2f2"; break;
                case "3": col = "#ffff80"; break;
                case "4": col = "#fdc375"; break;
                case "5": col = "#ff8a8a"; break;
                case "6": col = "#ff5555"; break;
        }

        params.formatted = col; // add formatted value
        return params; // return object
    },
    
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
	
	worstCol : function(params){
		
		params.formatted = "#0080ff";
		return params;
	},
	
	worstErr : function(params){

		var val = 0;
		for(var key in params){
			if(typeof params[ key ] == "object"){
				if(params[ key ].object[ params[ key ].param ] > val) val = params[ key ].object[ params[ key ].param ];
			}
		}

		var stat;
        switch(val.toString()){
			case "0": stat = "OK"; break;
			case "1": stat = "GuessOk"; break;
			case "2": stat = "Unknown"; break;
			case "3": stat = "Warning"; break;
			case "4": stat = "Minor"; break;
			case "5": stat = "Major"; break;
			case "6": stat = "Critical"; break;
        }

        params.formatted = stat; // add formatted value
		return params;
	},

    // LED (NMS specific colors)
    LED : function(params){

        var col; // color
        switch(params[0].object.mapped[ params[0].param ]){
                case "1": col = "#ccc"; break;
                case "2": col = "red"; break;
                case "3": col = "yellow"; break;
                case "4": col = "#60E065"; break;
                case "5": col = "orange"; break;
                case "8": col = "blue"; break;
                default : col = "#fff";
        } 
        params.formatted = "<span style='width:16px; height:16px; background:" + col + "; display:block; border-radius:8px;'></span>";
        return params;

    },
    
    // parameter-name: <led>
    descrLED : function(params){

        var name = params[0].object.getParamName( params[0].param ); // resolve mib-name

        var col; // color
        switch(params[0].object.mapped[ params[0].param ] ){
            case "1": col = "#ccc"; break;
            case "2": col = "red"; break;
            case "3": col = "yellow"; break;
            case "4": col = "#60E065"; break;
            case "5": col = "orange"; break;
            case "8": col = "blue"; break;
            default : col = "#fff";
        } 

        params.formatted = "<div><span class='LED' style='background:" + col + ";'></span></div><div title='" + name + "'>" + name + "</div>"; // set text
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
    
    // description parameter name : alias/mapped (if available)
    descr : function(params){
 
        var obj = params[0].object; // get module instance
        var mib_name = params[0].param;

        // get name corresponding to mib-name
        var name;
        if( !! obj.aliases[ mib_name ]){
            name = obj.aliases[ mib_name ]; // get alias correspondeing to mib parameter
        }else if( !! obj.names[ mib_name ]){
            name = obj.names[ mib_name ]; // parameter name
        }else{
            name = mib_name; // default to mib-name
        }

        // get value corresponding to mib name
        var val;
        if(obj[ mib_name ]){
            val = obj[ mib_name ];
        }else if( !! obj.mapped[ mib_name ]){
            val = obj.mapped[mib_name]; // mapped value
        }else{
            val = obj[ mib_name ]; // raw value
        }

        if(!val) val = "-"; // default

        params.formatted = "<div title='" + val + "'>" + val + "</div><div title='" + name + "'>" + name + "</div>"; // add formatted value
        return params; // return object
    },
}
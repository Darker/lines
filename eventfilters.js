var requires = [];
if (!Array.prototype.find) {
  requires.push("polyfill/array.find");
}


define(requires, function() {
  /** 
   * Filter can alter packets that are being sent or received.
   ***/  
  /** Note that process data is applied on the socket connection
   * this_processData.call(socket, name, params, game);
   * Parameters:
   *   rule        - string/regexp/function - defines which events should be filtered by this filter
   *   processData - function               - called on data if this filter applies
   *   applies     - object                 - Applies only on server or client. Default true {server:false/true, client:false/true}        
  */    
  function Filter(rule, processData, applies) {
    this.rule = rule;
    if(typeof applies!="object") {
      applies = {};
    }
    
    this.server = applies.server===false?false:true;
    this.client = applies.client===false?false:true;
    this.silent = applies.silent===true;
    this.inverse = applies.inverse===true;

    if(typeof processData=="function")
      this._processData = processData;
  }
  Filter.prototype.appliesOn = function(name, isServer) {
    if(isServer && !this.server || !isServer && !this.client)
      return false;
    // Saving return in variable allows .inverse to work
    var ret = true;
    
    if(typeof this.rule=="string") 
      ret = name==this.rule;
    else if(this.rule instanceof RegExp) 
      ret = this.rule.test(name);
    else if(typeof this.rule=="function")
      ret = this.rule(name, isServer);
    if(this.inverse)
      ret = !ret;  
      
    //console.info("FILTER ",this.name, " ",(ret?"applies":"does not apply"), " on event ", name);  
    /*if(this.inverse)
      return !ret;
    else  */
      return ret;
  }
  /**
   * Last parameter can be any object that may be used to store internal variables **/     
  Filter.prototype.processData = function(name, params, game, socket) {
    return this._processData.call(socket, name, params, game);
  }
  /** Database of static filters.
   *  Can be used to store named filters as properties. */  
  function FilterDatabase(){};
  FilterDatabase.prototype.pushTo = function(array) {
    for(var i in this) {
      if(this.hasOwnProperty[i] && i[0]!="_") {
        array.push(this[i]);
      } 
    }
  }
  /**
   * Expects object that contains:
    {server: true/valse,
     "arrayName": []}    
     
     Advantage of this method is that it won't push filters that would never apply, that
     is the filters that are server/client only.                                               
  */     
  FilterDatabase.prototype.pushToTarget = function(socket, arrayName) {
    var server = socket.server;
    var array = socket[arrayName];
    for(var i in this) {
      var f = this[i];
      if(f instanceof Filter && i[0]!="_" && (f.server && server || f.client && !server)) {
        f.name = i;
        array.push(f);
        //console.log("FILTER install ",i, " on ", (server?"server":"client"));
      } 
    }
  }
  function FilterList() {
    Array.apply(this, arguments); 
  }
  FilterList.prototype = Object.create(Array.prototype)
  FilterList.prototype.checkAll = function(caller, game, name, params) {
    var canContinue = true;
    for(var i=0,l=this.length; i<l && canContinue!==false; i++) {
      var f = this[i];
      if(f.appliesOn(name, caller.server)) {
        try {
          canContinue = f.processData(name, params, game, caller);
          if(canContinue===false && !f.silent) 
            console.warn("FILTER ",f.name," FAILED ",name,"(",params,")."); 
        }
        catch(e) {
          console.warn("FILTER ",f.name," ERROR [",name,"]: ", e);
          console.log(e.stack);
          canContinue = false;
        }
      }
    }
    return canContinue!==false;
  }
  Filter.List = FilterList;
  
  Filter.in = new FilterDatabase();
  Filter.out = new FilterDatabase();
  //Individual filters
  Filter.in.NEW_LINE_FILTER = new Filter("line.requested", 
    function(name, params, game) {
      var id = Math.random();
      this.requestedLines.push(id);
      params.push(id); 
      //console.log("Requesting line with secure hash #",id);   
      if(params.length>3)
          throw new Error("SecurityError: malformed line.requested event. Maybe an attempt to fake secure ID? Data: ",params);
      //params[0] = params[0].replace(this.settings.name_filter_regex, "").substr(0, 16);
    },
    {client: false}
  );
  function pointDist(a,b) {
    return Math.sqrt((a[0]-b[0])*(a[0]-b[0]) + 
                     (a[1]-b[1])*(a[1]-b[1]) +
                     (a[2]-b[2])*(a[2]-b[2])) 
  }
  function colorFromInt(c) {
    return [(c&0xFF0000)>>16, (c&0xFF00)>>8, c&0xFF];
  }
  Filter.in.NEW_LINE_PROPERTIES = new Filter("line.requested", 
    function(name, params, game) {
      if(this.settings) {
        // Check line count
         if((this.server && this.ownedLines.length>=this.settings.max_lines) ||
           (!this.server && game.localLines.length>=this.settings.max_lines)
        ) {
          this.eventToClient("clientonly.msg.lineDeclined", ["Maximum number of "+this.settings.max_lines+" players per window exceeded."]);
          return false;
        }
        // Check name matching
        
        var c = params[1] = Math.round(params[1]);

        var name = params[0].replace(this.settings.name_filter_regex, "").substr(0, 16);
        if(name.length<2) { 
          this.eventToClient("clientonly.msg.lineDeclined", ["After replacing invalid characters, name is too short."]);
          return false;
        }
        
        var nameMatch = params[0].replace(/[^a-z0-9]/g,"");
        var colorPoint = [(c&0xFF0000)>>16, (c&0xFF00)>>8, c&0xFF];
        // Prevent black color
        if(pointDist(colorPoint, [0,0,0])<this.settings.min_color_diff) {
            this.eventToClient("clientonly.msg.lineDeclined", ["Picked color is too dark!"]);
            return false;  
        }
        
        for(var i=0,l=game.lines.length; i<l; i++) {
          var line = game.lines[i];
          if(nameMatch==line.name) {
            this.eventToClient("clientonly.msg.lineDeclined", ["Selected player name resembles existing name!"]);
            return false;
          }      
          //var dist;
          if(pointDist(colorPoint, colorFromInt(line.color))<this.settings.min_color_diff) {
            this.eventToClient("clientonly.msg.lineDeclined", ["Selected player color resembles someone else's color!"]);
            return false;
          }
        }
        params[0] = name;
      }
      return true;
    }
  );
  
  Filter.out.NEW_LINE_FILTER = new Filter("line.added", 
    function(name, params, game) {
      var requestID = params[3];
      //Replace the ID with argument indicating whether the line is local or not
      params[3] = false;
      //console.log("Line with secure hash #",requestID, " added. My hashes: ", this.requestedLines); 
      var index;
      if((index=this.requestedLines.indexOf(requestID))>=0) {
        this.requestedLines.splice(index, 1);
        this.ownedLines.push(game.lineById(params[0]));
        params[3] = true;
        //console.log("Client received line with id #", params[0], " using secure hash #",requestID);
        //console.log("My lines: ", this.ownedLines);
      }
    },
    {client: false}
  );
  Filter.in.LOCAL_EVENTS = Filter.out.LOCAL_EVENTS = new Filter(/local\..*?/,
    function() {
      return false;
    },
    {silent: true}
  );
  
  Filter.in.LINE_CONTROL_FILTER = new Filter(/line\.(?!requested|added)[a-z.]+/, 
    function(name, params, game) {
      var line = this.ownedLines.find(function(line) {return line.id==params[0]});
      if(line==undefined)
        throw new Error("Attempt to affect competing line (moving line that is not owned)");
      // Log activity to prefent AFK bust
      if(name=="line.rotation") {
        line.logActivity();
      }
    },
    {client: false}
  );
  /** AFK buster **/
  Filter.out.GAME_OVER_AFK_BUST = new Filter("game.over", 
    function(name, params, game) {
      game.playingLines.forEach(function(line) {
        if(line.lastActivity<game.gameStartTime) {
          game.activateLine(line, false);
        }
      });
      return true;
    },
    {client: false}
  );
  Filter.in.BANNED_CLIENT_COMMANDS_FILTER = new Filter(/(control\.restart|line\.(added|removed))/, 
    function(name, params, game) {
        throw new Error("Tried to "+name+".");
    }
  );
  Filter.in.RESTART_FILTER = new Filter(/control\.start/, 
    function(name, params, game) {
      if(game.running)
        throw new Error("Tried to "+name+" running game.");
      var localLines = this.server?this.ownedLines:game.localLines;
      // At least one local line is required to start a game
      if(localLines.length>0 && localLines.find(function(line) {return line.active})!=undefined) {
        return true;
      }
      
      return false;
    }
  );
  

  var loggingRegex = /(pixels\..*?|lines\.moved|line\.rotation)/;    
  Filter.out.LOGGING = new Filter(loggingRegex,
    function(name, params, game) {console.log((this.server?"SENT":"RECEIVED")+" EVENT: ", name, "(",params,")");},
    {inverse: true,
     server: false,
     client: false}
  );
  Filter.in.LOGGING = new Filter(loggingRegex,
    function(name, params, game) {console.log((!this.server?"SENT":"RECEIVED")+" EVENT: ", name, "(",params,")");},
    {inverse: true,
     server: !true,
     client: false
     }
  );
  return Filter;
  
});
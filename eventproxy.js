define(["eventfilters"], function(Filter) {
  function GameEventProxy(game) {
    //this.setGame(game);
    this.setGame(game);
    this.ignoreEvents = false;
    this.connections = [];
  }
  GameEventProxy.prototype.eventReceived = function(name, params) {
    if(this.game!=null) {
      //console.log("["+this.game.name+"] recv callback "+name+"(",params,")");
      params.unshift(name);
      // Prevent endless loop
      this.ignoreEvents = true;
      this.ignoredEvent = name;
      
      this.game.emit.apply(this.game, params);
  
      //console.log("NO Ignore events.",rnd);
      // Allow event capture again (although it should be already false here)
      this.ignoreEvents = false;
    }
  }
  GameEventProxy.prototype.eventSend = function(name, params) {
    if(this.connections.length>0) {
      for(var i=0,l=this.connections.length; i<l; i++)
        this.connections[i].eventSend(name, params);
    }
    else
      console.warn("Missing connection for GameEventProxy, event "+name+" missed...");
  }
  GameEventProxy.prototype.setGame = function(game) {
    // Remove old callback if exists
    if(this.game!=null) {
      this.game.offAny(this.onAnyCb);
    }       
    // Assign game and callback
    this.game = game;
    var _this = this;
    game.onAny(this.onAnyCb = function() {
      //console.log("["+_this.game.name+"] "+(_this.ignoreEvents?"[IGN]":"")+" snd callback "+this.event+"("+Array.prototype.join.call(arguments, ", ")+")");
      if(!_this.ignoreEvents) {
        _this.eventSend(this.event, arguments);
      }
      else {
        if(this.event!=_this.ignoredEvent)
          console.error("Wrong event ignored!");
        // if the event to be ignored was ignored, continue
        _this.ignoreEvents = false;
      }
    });
  }
  GameEventProxy.prototype.addConnection = function(connection) {
    
    this.connections.push(connection);
    connection.eventSink = this;
  }
  GameEventProxy.prototype.removeConnection = function(connection) {
    var index = this.connections.indexOf(connection);
    if(index!=-1) {
      this.connections.splice(index, 1);
      connection.eventSink = null;
    }
    else {
      console.warn("removing nonexistent connection", connection);
    }
  }
  /**
   * Shortcut function for assigning new connections and proxy
   * returns the new connection so that you can work with it**/ 
  GameEventProxy.connectUsing = function(game, ctor) {
    var connection;
    if(typeof ctor == "function") 
      connection = new ctor();  
    else if(typeof ctor.eventSend == "function")
      connection = ctor;
    else
      throw new Error("Invalid connection node.");
    var proxy = new GameEventProxy(game);
    proxy.addConnection(connection);
    // Return connection so that more things can be configured with it
    return connection;
  }

  /**
   * Basic connection that connects directly to another PlainEventCon
   * in same scope and thread. Used mainly for testing. 
  **/  
  function PlainEventCon() {}
  
  PlainEventCon.prototype.eventSend = function(name, params) {
    if(this.partner!=null) {
       var ar = [];
       ar.push.apply(ar, params);     
       this.partner.eventReceived(name, ar);
    }
    else
      console.warn("Trying to send data without a partner.");
  }
  PlainEventCon.prototype.eventReceived = function(name, params) {
    if(this.eventSink!=null)
       this.eventSink.eventReceived(name, params);
    else
      console.warn("Received event, but has no place to sink it in.");
  }
  /**
   * Expects another PlainEventCon **/
  PlainEventCon.prototype.connect = function(con) {
    this.partner = con;
    con.partner = this;
  };       
  GameEventProxy.PlainEventCon = PlainEventCon;
  
  function WorkerEventCon(worker) {
    if(typeof Worker=="function" && worker instanceof Worker)
      this.setWorker(worker);
  }
  WorkerEventCon.prototype.parseEvent = function(name, data) {
    var params;
    if(data.type == "serialized") {
      params = data.params;
    }
    else if(data.type == "source") {
      try {
        params = eval("("+data.source+")");
      }
      catch(e) {
        throw new Error("Malformed data. Inner exception was: "+e, e);
      } 
    }
    else if(data.type == "json") {
      params = JSON.parse(data.json);
    }
    else {
      throw new Error("Unknown data.");
    }
    this.eventSink.eventReceived(name, params);
  } 
  WorkerEventCon.prototype.setWorker = function(worker) {
    var _this = this;                         
    
    worker.addEventListener("message", function(e) {
      var data = e.data;
      if(data.proxyEvent!=null) {
        //console.log("Received: "+data.proxyEvent);
        _this.parseEvent(data.proxyEvent, data);
      }
      else {
        console.warn("Unknown event: "+data);
      } 
    });
    this.worker = worker;
  }
  WorkerEventCon.prototype.eventSend = function(name, params) {
    //console.trace();
    var ar = [];
    ar.push.apply(ar, params);
    //console.log("Sending: "+name+"(",ar.join(", "), ")"); 
    try {
      this.worker.postMessage({proxyEvent: name, type: "serialized", params: ar});
    }
    catch(e) {
      this.worker.postMessage({proxyEvent: name, type: "source", source: ar.toSource()});
    }
    //console.log("Sent.");
  };
  GameEventProxy.WorkerEventCon = WorkerEventCon;
  
  
  function SocketEventCon(io) {
    if(typeof io!="undefined" && io.on)
      this.setSocket(io);
    this.id = SocketEventCon.ID++;
    this.requestedLines = [];
    this.ownedLines = [];
    this.inputFilters = new Filter.List();
    this.outputFilters = new Filter.List();
  }
  SocketEventCon.prototype.setSocket = function(io) {
    if(typeof io!="undefined" && io.on) {
      this.io = io;
      var _this = this;
      var game = this.eventSink.game;
      io.on("event", this.evtList = function(name, params) {
        _this.parseEvent(name, params);
      });
      io.on("disconnect", this.discList = function() {
        if(_this.server) {
          _this.ownedLines.map(function(line) {
            if(game.running) {
              game.once("game.over", function() {game.removeLine(line);});
            }
            else {
              //console.log("Removing line #"+line);
              game.removeLine(line);
            }
          });
          _this.destroy();
        }
        else {
          if(game.initialized) {
            game.clearLines();
            game.pixels.reset();
          }
        }
        //console.log("Disconnected, destroying client "+_this);
      }); 
      //Send inital information
      
      if(this.server) {
        if(game.pixels!=null)
          io.emit("event", "game.init", [game.width, game.height]);
        if(game.lines.length>0) {
          game.lines.forEach(function(line) {
            io.emit("event", "line.added", [line.id, line.name, line.color]);
            io.emit("event", "line.changed", [line.id, line.getProperties()]);
          });
        }
      }
    }
    else {
      console.error(io);
      throw new Error("Invalid socket IO instance.");
    }
  }
  SocketEventCon.prototype.parseEvent = function(name, data) {
    var ar = [];
    if(data!=null) {
      data.length = Object.keys(data).length;
      ar.push.apply(ar, data); 
    }

    if(this.inputFilters.checkAll(this, this.eventSink.game, name, ar)) {
      try {
        this.eventSink.eventReceived(name, ar);
      }
      catch(e) {
        console.log("User caused error during event '"+name+"': ", e);
        console.log(e.stack);
        this.eventSend("errorMessage", e.messsage);
      }
    }
    else {
      //console.log("Event canceled: "+name+"(",ar,")");
    }
  } 
  SocketEventCon.prototype.eventSend = function(name, params) {
    /*var ar = [];
    params.length = Object.keys(params).length;
    ar.push.apply(ar, params);
    console.log("SendEvent: ", name, ar, "Converted from: ",params);  */
    var args = [];
    if(params!=null) {
      args.push.apply(args, params);
    }
    if(this.outputFilters.checkAll(this, this.eventSink.game, name, args)) {
      this.io.emit("event", name, args);
    }
  };           
  /**
   * Regerdless whether called on server or client, this method allways
   * tries to emit client-side event ***/     
  SocketEventCon.prototype.eventToClient = function(name, params) {
    if(this.server)
      this.eventSend(name, params);
    else
      this.parseEvent(name, params);
  }
  /**
   * Regerdless whether called on server or client, this method allways
   * tries to emit server-side event ***/     
  SocketEventCon.prototype.eventToServer = function(name, params) {
    if(!this.server)
      this.eventSend(name, params);
    else
      this.parseEvent(name, params);
  }
  /**
   * Input filters are filters controlling data from client to server **/  
  SocketEventCon.prototype.addInputFilter = function(filter) {
    this.inputFilters.push(filter);
  }
  /**
   * Outpu filters are filters controlling data from client to server **/  
  SocketEventCon.prototype.addOutputFilter = function(filter) {
    this.outputFilters.push(filter);
  }
  SocketEventCon.prototype.toString = function() {
    return "["+(this.server?"SERVER":"CLIENT")+"] #"+this.id;
  }
  SocketEventCon.prototype.destroy = function() {
    this.io.removeListener("event", this.evtList);
    this.io.removeListener("disconnect", this.discList);
    delete this.inputFilters;
    delete this.outputFilters;
    delete this.io;
    delete this.ownedLines;
    this.eventSink.removeConnection(this);
  }
  SocketEventCon.ID = 0;
  
  function PingGuard(socket, server) {
    this.lastPing = -1;
    this.lastPingDuration = 0;
    this.socket = socket;
    this.pingInterval = 1000;
    this.pingTreshold = 3000;
    //this.isServer = server===true;
    
    
    var _this = this;
    socket.on("ping", this.cb=function(id) {
      _this.pingArrived(id);
    });
    socket.on("pingResponse", this.cb=function(id) {
      _this.pingResponse(id);
    });
  }

  PingGuard.prototype.ping = function() {
    if(this.lastPing==-1) {
      this.lastPing = Math.random();
      this.socket.emit("ping", this.lastPing, this.lastPingDuration);
      this.pingTime = new Date().getTime();
      
      var _this = this;
      this.pingTimeout = setTimeout(function() {_this.pingFailed();}, this.pingTreshold);
    }
    else {
      throw new Error();
    }
  }
  PingGuard.prototype.pingFailed = function() {
    console.warn("Ping timeout.");
    this.socket.disconnect();
  }
  PingGuard.prototype.pingArrived = function(id, lastDuration) {
    this.socket.emit("pingResponse", id);
  }
  
  
  
  
  GameEventProxy.SocketEventCon = SocketEventCon;
  return GameEventProxy;
  /*(function testPlainProxy() {
    var node1 = new EventEmitter2();
    node1.name = "NODE1";
    var node2 = new EventEmitter2();
    node2.name = "NODE2";
  
    var con1 = GameEventProxy.connectUsing(node1, PlainEventCon);
    var con2 = GameEventProxy.connectUsing(node2, PlainEventCon);
    con1.connect(con2);
    var echo = function(msg) {console.info("Node "+this.name+" received message from "+msg);};
    node2.on("pokus", echo);
    node1.on("pokus", echo);
    node1.emit("pokus", "NODE1");
    node2.emit("pokus", "NODE2");
    
  })();  */
  
  
  
  
  /*if(typeof importScripts!="function") {
    (function testWorkerProxy() {  
    
      function test(workerObject_) {
        //console.log("Line 2");
        var worker = false;
        var workerObject;
        if(typeof importScripts=="function") {
          worker = true;
          workerObject = self; 
          var window = {};
          importScripts("http://127.0.0.1/lines/eventemitter2.js");
          importScripts("http://127.0.0.1/lines/eventproxy.js");
          self.EventEmitter2 = window.EventEmitter2;
        }
        else {
          workerObject = workerObject_;
        }
        var node = new EventEmitter2();
        node.name = worker?"WORKER NODE": "CLIENT NODE";
        var echo = function(msg) {console.info("Node "+this.name+" received message from "+msg);};
        var con = GameEventProxy.connectUsing(node, WorkerEventCon);
        con.setWorker(workerObject);
        console.log(node.name, workerObject);
        if(worker) {
          node.on("secti", function(x, y) {
            //console.log("Scitam ",x, "+", y);
            this.emit("vysledek", x+y);
          });
          node.on("vynasob", function(x,y) {
            this.emit("vysledek", x*y);
          });
          //window.node = node;
        }
        else {
          node.on("vysledek", function(x) {console.log("Vyslo: ",x);});
          node.on("init", function() {console.log("Worker initialised.");});
          node.emit("secti", 5,5);
          node.emit("vynasob", 6,6);
          console.log("Messages sent.",location, self);
          //console.log(location);
          self.node = node;
        }
      }
      // Create blob from function
      var blob = new Blob([test.toString().match(new RegExp("function[^{]+\\{([\\s\\S]*)\\}$"))[1]]);
      //console.log(test.toString().match(new RegExp("function[^{]+\\{([\\s\\S]*)\\}$"))[1]);
      // Obtain a blob URL reference to our worker 'file'.
      var blobURL = window.URL.createObjectURL(blob);
      
      var worker = new Worker(blobURL);
      test(worker);
    
    })();
  }       */
});
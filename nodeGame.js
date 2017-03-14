var requirejs = require("requirejs");
requirejs.config({
    baseUrl: __dirname,
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
    waitSeconds: 20
});



requirejs(['game', 'eventproxy', 'http', 'socket.io', 'simple-http', 'lines_settings'],
function(Game, EventProxy, Http, SocketIo, simpleServer, settings) {
  var Filters;
  requirejs(["eventfilters"], function(_evfil) {
    Filters = _evfil;
  });
  
  var http = Http.Server(simpleServer);
  var io = SocketIo(http);
  
  var game = new Game.Master(500, 500);
  game.name =  "MASTER";
  var proxy = new EventProxy(game);
  //var con =  EventProxy.GameEventProxy.connectUsing(game,  EventProxy.WorkerEventCon);
  //game.init();
  global.game = game;
  // Remember sockets per IP
  var IP_SOCKET_MAP = {
    add: function(ip) {
      if(this[ip]==null)
        this[ip]=0;
      return ++this[ip];  
    },
    remove: function(ip) {
      this[ip]--; 
    }
  };
  
  io.on('connection', function(socket) {
    var IP = socket.request.connection.remoteAddress;
    //console.log("Client ",IP," has connected.");
    socket.on("disconnect", function() {
      IP_SOCKET_MAP.remove(IP);
      //clearInterval(interval);
      //console.log("Client ",IP," left.");
    }); 
    
    // Check for count of connections
    var count = IP_SOCKET_MAP.add(IP);
    //console.log("IP: ",IP," COUNT: ",count);
    if(count>4) {
      socket.emit("errorMessage", "Too many open connections from IP "+IP+" - do you have other tabs open?");
      socket.disconnect();
      return;
    }
    
    //var con = EventProxy.connectUsing(game, EventProxy.SocketEventCon);
    var con = new EventProxy.SocketEventCon();
    con.server = true;
    con.settings = settings;
    proxy.addConnection(con);
    Filters.in.pushToTarget(con, "inputFilters");
    Filters.out.pushToTarget(con, "outputFilters");
    con.setSocket(socket);

    socket.on("client.ready", function() {
      socket.emit("event", "game.init", [game.width, game.height]);
    });
    //game.init();
  });
  var port = process.env.PORT || 3000;
  http.listen(port, function(){
    console.log('listening on *:'+port);
  });
  game.init();
  
  /*requirejs(["AIPlayer"], function(AIPlayer) {
    var line = game.createLine("AI", 0xFF0000, -1);
    var AI = new AIPlayer(game, line);
  }); */
 // function SocketGuard()
  
});
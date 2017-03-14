var window = self;
importScripts("require.js");
self.define = define;
self.requirejs = requirejs;

requirejs.config({baseUrl: '.',});
requirejs(['game', 'eventproxy'],
  function(Game, EventProxy) {
    var game = new Game.Master(500, 500);
    game.name =  "MASTER";
    var con = EventProxy.connectUsing(game, EventProxy.WorkerEventCon); 
    con.setWorker(self);
    game.init();
  }
);

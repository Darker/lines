if(typeof requirejs!="function") {
  if(typeof self=="undefined" && require) {
    try {
      requirejs = require("requirejs");
    }
    catch(e){}
  }
  if(typeof requirejs!="function") {
    throw new Error("Require.js is required for this script to load it's dependencies.");
  }
}

/** Represents main game engine. Can serve both as master, chosing who lost and
 *  calculating real game data, and slave that just calculates ghost
 *  data and processes remote events.
 *  
 *  The slave and master roles are further subclassed.
 *
 *     **/ 
define(["eventemitter2", "pixels", "line", "pixels", "effect"], function(EventEmitter2, Pixels, Line, Pixels, Effect) { 
  //var Line;
  /*function LazyConstructor(name) {
    return function() {
      var _this = this;
      var args = arguments;
      console.warn("Constructing lazy!");
      requirejs([name], function(ctor) { 
        //console.warn("Constructing lazy after! ", args, ctor.prototype);
        _this.__proto__ = Object.create(ctor.prototype);
        ctor.apply(_this, args);
      });
    }
  }
  var modules = ["Line", "Pixels"];
  
  for(var i=0; i<modules.length; i++) {
    var filename = modules[i]
                  .replace(/([a-z])([A-Z])/g, function(a, b, c) {return b+"-"+c.toLowerCase()})
                  .toLowerCase();
    // It's been many years since I last used eval
    // It's also been many years and nobody came up with reliable refference
    // to object containing local scope and ideally parent scopes too
    eval("var "+modules[i]+" = LazyConstructor(\""+filename+"\");");              
    requireLater(filename, modules[i]);
  }
  function requireLater(name, varName) {
    requirejs([name], function(object) {
      // Nasty indeed, and confuses the hell out of people who are not used to JS scopes
      eval(varName+"=object");
    });
  }     */
  
  function LineGame(width, height) {
    this.lines = [];
    this.master = false;
    this.width = width;
    this.height = height;
    this.initialized = false;
    EventEmitter2.call(this, {wildcard: !this.master, newListener: false});
    var _this = this;
    this.on("line.activated", function(id, state) {
      var line = this.lineById(id);
      if(line)
        this.activateLine(line, state);     
    });
  }
  LineGame.prototype = Object.create(EventEmitter2.prototype);
  LineGame.prototype.init = function() {
    if(this.pixels!=null)
      return;
    this.pixels = new Pixels(this.width, this.height);
    if(this.renderer!=null) {
      this.setUpRenderer();
      //if(document)
      //  document.body.className = "game";
    }
    this.initialized = true;
    /*if(this.lines.length==0) {
      var line;
      var w = this.width/2;
      var h = this.height/2;
      this.lines.push(line=new Line("Blue line", 0x008BFF));
      line.initPen(w, h);
      //this.setLineControls(line, 37,39);
      var colors = [0x116611, 0xFFFFFF, 0xFF0000, 0xFFFF00];
      for(var i=0,l=Math.min(0, colors.length); i<l; i++) {
        this.lines.push(line=new Line("Player "+(i+1), colors[i]));
        line.initPen(w,h);
      }
    }   */
    //var _this = this;
    /**window.addEventListener("keyup", function(e) {
      console.log(e.keyCode);
      if(e.keyCode==82) {
        _this.restart();
        e.preventDefault();
        return false;
      }
    });   **/
    //this.restart();
  }
  LineGame.prototype.restart = function() {
    if(this.running)
      this.stop();
    if(this.pixels)
      this.pixels.reset();
  }

  /** This gives lines positions and also allows them to move again **/
  LineGame.prototype.resetLines = function(changePosition) {
    if(changePosition) {
      var l = this.lines.length;
      var angleIncrement = 360/l;
      var randomOffset = Math.random()*360;
      var angle = randomOffset;
      var lines = Object.create(this.lines);
      shuffleArray(lines);
      for(var i=0; i<l; i++) {
        lines[i].reset();
        lines[i].rotation = angle;
        lines[i].movePen(5);
        this.emit("line.moved", lines[i].id, lines[i].getPositionData()); 
        angle+=angleIncrement;
      }
    }
    else {
      this.lines.forEach(function(line) {line.reset();});
    }
    this.linesChanged();
  }
  LineGame.prototype.killLine = function(id) {
    var line = this.lineById(id);
    if(line) {
      line.moving = false;
      line.dead = true;
      this.linesChanged();
    }
    else
      console.warn("No such line: ", id);
  }
  /**
   * Sets line activity state, which indicates whether the line joins games.
   * If second argument is ommited, state is toggled.   
  **/     
  LineGame.prototype.activateLine = function(line, state, localevent) {
    var old = line.active;
    line.active = typeof state=="undefined"?!line.active:state;
    if(old!=line.active) {
      if(this.master || line.local)
        this.emit("line.activated", line.id, line.active);
      //console.log("Line ",line.id," changed: ",(line.active?"active":"inactive"));
      this.linesChanged();
    }
    //else 
    //  console.log("Line ",line.id," not changed: ",(line.active?"active":"inactive"));
  }
  LineGame.prototype.setLine = function(id, name, color, local) {
    var line = new Line(name, color, this, id);
    if(typeof local=="boolean")
      line.local = local;
    this.lines.push(line);

    this.linesChanged();
    this.emit("local.line.added", line);
    //this.emit("line.added", line);
  }
  LineGame.prototype.removeLine = function(id) {
    if(id.id!=undefined) {
      this.lines.splice(this.lines.indexOf(id), 1);
      id = id.id;
    }
    else {
      this.lines.splice(this.lineIndexById(id), 1);
    }
    if(this.master)
      this.emit("line.removed", id);
    else 
      this.emit("local.line.removed", id);
    this.linesChanged();
  }
  LineGame.prototype.clearLines = function() {
    if(this.lines.length>0) {
      var lines = this.lines;
      this.lines = [];
      this.linesChanged();
      var _this = this;
      if(this.master)
        lines.forEach(function(line) {_this.emit("line.removed", line.id);});
      else 
        lines.forEach(function(line) {_this.emit("local.line.removed", line.id);});
    }
  }
  LineGame.prototype.linesChanged = function() {
    this._localLines = false;
    this._activeLineCount = null;
    //if(this.renderer)
    //  this.renderer.drawPlayerList(this.lines);
    this.emit("local.lines.changed");
  }
  Object.defineProperty(LineGame.prototype, "localLines", {
        get: function() {
          if(this._localLines)
            return this._localLines;
          var loc = this._localLines = [];
          this.lines.forEach(function(l) {if(l.local)loc.push(l);});
          return loc;
        }
      }
  );
  LineGame.prototype.activeLineCount = function() {
    if(this._activeLineCount==null || this._activeLineCount_L!=this.lines.length) {
      var count = 0;
      this.lines.forEach(function(l) {
        if(l.active)
          count++;
      });
      this._activeLineCount = count;
    }
    return this._activeLineCount;
  }
  LineGame.prototype.lineById = function(id) {
    if(id instanceof Line)
      return id;
    //var ids = [];
    for(var i=0,l=this.lines.length; i<l; i++) {
      if(id==this.lines[i].id)
        return this.lines[i];
      //ids.push(this.lines[i].id);
    }
    return null;
    //throw new Error("No such line (id: "+id+"). Available: "+ ids);
  }
  LineGame.prototype.lineExists = function(line) {
    return this.lines.indexOf(line)!=-1;
  }
  LineGame.prototype.lineIndexById = function(id) {
    //var ids = [];
    for(var i=0,l=this.lines.length; i<l; i++) {
      if(id==this.lines[i].id)
        return i;
      //ids.push(this.lines[i].id);
    }
    //throw new Error("No such line (id: "+id+"). Available: "+ ids.join(","));
  }
  /**
   * Returns centroid for all line locations **/
  LineGame.prototype.linesCentroid = function(preferLocal) {
    var l=this.lines.length;
    // For 1 line return line position (optimalization)
    if(l==1) 
      return Object.create(this.lines[0].pen);
    // Centrid is just average location. Sad but true
    var centroid = [0,0]; 
    // Count how many numbers were added into the point
    var entries = 0;
    var foundLocal = false;
    for(var i=0; i<l; i++) { 
      var li = this.lines[i];
      // Inactive lines can be skipped as well as dead ones
      if(!li.active || li.dead)
        continue;
      //If this is local and we look for local forget all non-local and skip
      //non-local in future
      if(preferLocal && !foundLocal && li.local) {
        foundLocal = true;
        centroid[0] = centroid[1] = 0;
        entries = 0;
      }
      if(foundLocal && !li.local)
        continue;
      centroid[0]+=li.pen[0];
      centroid[1]+=li.pen[1];
      entries++;
    }
    centroid[0] /= entries;
    centroid[1] /= entries;
    return centroid;
  }  
  /** PRIVATE
   *  sets up renderer properties and assigns any pixel arrays.
  **/ 
  LineGame.prototype.setUpRenderer = function(renderer) {
    if(!this.rendererIsSetup) {
      this.renderer.addPixels(this.pixels);
      this.renderer.center();
      this.renderer.startRendering();
      this.renderer.drawPlayerList();
    }
    this.rendererIsSetup = true;
  }
  /**
   *  Set up pixie renderer object to draw the game. The object will be initialised
   *  when the game is initialised or immediately, if the game already was initialised.
   *    
  **/ 
  LineGame.prototype.setRenderer = function(renderer) {
    if(renderer!=this.renderer) {
      this.rendererIsSetup = false;
      this.renderer = renderer;
      if(this.pixels) {
        this.setUpRenderer();
      }
    }
  }
  
  
  
  LineGame.prototype.gameOver = function(lines) {
    this.playingLines = null;
    this.emit("game.over", lines);
    this.stop();
  }
  

  LineGame.prototype.gameLoop = function() {
    console.trace();
    console.log(this);
    throw new Error("Invalid prototype!");
  }
  
  
  function LineGameMaster(width, height) {
    LineGame.apply(this, arguments);
    this.master = true;
    this.on("line.rotation", this.encloseCallback(this.moveLine)); 
    this.on("line.requested", this.encloseCallback(this.createLine)); 
    this.on("control.restart", this.encloseCallback(this.restart));
    this.on("control.start", this.encloseCallback(this.start));
    this.on("dummy", this.encloseCallback(this.dummy));
  }
  LineGameMaster.prototype = Object.create(LineGame.prototype);
  LineGameMaster.prototype.encloseCallback = function(fn) {
    var _this = this;
    return function() {
      fn.apply(_this, arguments);
    }
  }
  /**
   * Creates line and sends it to client 
  **/ 
  LineGameMaster.prototype.createLine = function(name, color, secureHash) {
    var line = new Line(name, color, this);
    line.initPen(Math.round(this.width/2), Math.round(this.height/2));
    this.lines.push(line);
    this.emit("line.added", line.id, line.name, line.color, secureHash);
    return line;
  }

  LineGameMaster.prototype.moveLine = function(id, movement) {
    //console.trace();
    var line = this.lineById(id);
    if(line.rotating!=movement) {
      line.rotating = movement;
      this.emit("line.rotation", id, movement);
    }
  } 
  LineGameMaster.prototype.dummy = function() {
    console.log("dummy");
    console.trace();
  }
  
  LineGameMaster.prototype.init = function() {
    this.emit("game.init", this.width, this.height);
    LineGame.prototype.init.call(this);
  }
  
  LineGameMaster.prototype.start = function() {
    this.playingLines = this.lines.filter(function(line) {return line.active;}); 
    if(this.playingLines.length==0) {
      throw new Error("No players, no game.");
    }
    this.gameStartTime = new Date().getTime();
    this.pixels.reset();
    this.emit("game.started", this.playingLines.map(function(l){return l.id;}));
    this.resetLines(true);
    this.gameLoop(true); 
  }
  LineGameMaster.prototype.gameOver = function(lines) {
    var startTime = this.gameStartTime;
    var t = ((new Date().getTime())-startTime)/1000;
    // All winners have current time as dead time
    for(var i=0,l=lines.length; i<l; i++) {
      lines[i].deadTime = t;
      //console.log("Line "+lines[i].name+" dead at: "+Math.round(lines[i].deadTime*2)/2);
    }
    // Calculate score TODO:
    var scoreArray = new Uint32Array(this.playingLines.length*2);
    // Order players by the order they died
    var playing = this.playingLines;
    playing.sort(function(a,b) {return a.deadTime-b.deadTime;});
    // Remember score change to avoid sending empty array
    var scoreChange = 0;
    // Calculate score based on order and play time;
    for(var i=0,l=playing.length; i<l; i++) {
      var line = playing[i];
      // First dead player get's 0 points, so we offset other's score by his dead time
      var time = line.deadTime - playing[0].deadTime;
      // Apply score formula
      var timeScore = Math.ceil(Math.sqrt(time)*5);
      var score = timeScore*i;
      console.log("Line "+line.name+" (#"+line.id+") lived for "+line.deadTime+" \n       Score:"+timeScore+"*"+i+"="+(timeScore*i));
      // Add score to line
      line.score+=score;
      scoreChange+=score;
      //Add to array
      scoreArray[i*2]=line.id;
      scoreArray[i*2+1]=line.score;
    } 
    if(scoreChange>0) {
      this.emit("lines.score.update.binary", scoreArray.buffer); 
      console.log("Sent score data.");
    }
    // Call the base game over
    LineGame.prototype.gameOver.call(this, lines.map(function(l){return l.id;}));
  }
  
  LineGameMaster.prototype.gameLoop = function(state) {
    if(state!==false)
      state = true;
    if(!state) {
      if(this.running) {
        clearTimeout(this.tIndex);
        this.tIndex = null;
        this.running = false;
        return;
      }
      else {
        return;
      }
    }
    if(this.running)
      return;
    //console.log("Starting game loop.");
    this.running = true;
    var _this = this;
    
    // run the render loop
    animate();
    function animate() {
      if(!_this.running)
        return;
      //console.log("Frame.");
      _this.frame();
      //_this.testLine.rotationSpeed-=_this.testLine.rotationSpeed/200;
      if(_this.running)
        _this.tIndex = setTimeout(animate,40);
      //console.log("Frame end.");
      //requestAnimationFrame(animate);
    }
  }
  
  LineGameMaster.prototype.frame = function() {
    
    // Count how many lines are alive
    // if just one (or less), game is over
    var alive = [];
    // Buffers for sending data, sent if not empty
    var dead = [];
    var capturedPixels = {};  
    var moved = [];
    
    for(var i=0,l=this.playingLines.length; i<l && this.running; i++) {
      var line = this.playingLines[i];
      if(!line.dead) {
        var data = this.lineFrame(line);
        if(data.dead) {
          dead.push(line.id);
          line.moving = false;
          line.dead = true;
          line.deadTime = (new Date().getTime()-this.gameStartTime)/1000;
          //console.log("Line "+line.name+" dead at: "+Math.round(line.deadTime*2)/2);
        }
        else {
          alive.push(line);
          if(Math.random()<0.015) {
            var e = new Effect.EffectSpace(260, line);
            e.apply();
          }    
        }
        if(line.penSentDistance()>2 || line.rotating!=0) {
          moved.push([line.id, line.getPositionData()]);
          line.logPenSent();
        }
        if(data.pixels.length>0) {
          capturedPixels[line.id] = data.pixels;
        }
      }
    }
    // Only send data if any pixels were added
    if(Object.getOwnPropertyNames(capturedPixels).length>0) {
      /*var bytes = new Uint32Array();
      var offset = 0;
      for(var i in capturedPixels) {
        var num = 1*i;
        if(Number.isNaN(num)) {
        
        }
      }   */
      this.emit("pixels.changed", capturedPixels);
    }
    // Only send moved if any line moved
    if(moved.length>0)
      this.emit("lines.moved", moved);
    // Send dead lines
    if(dead.length>0) {
      this.emit("lines.dead", dead);
    }
    // Game requires either >1 alive players or 1 alive player in 1 player game
    if(alive.length<2&&this.playingLines.length>1 || alive.length==0) {
      this.gameOver(alive); 
    }
  }
  LineGameMaster.prototype.lineFrame = function(line) {
    if(line.t==-1)
      line.startCounting();
    var oldpoints = line.oldpoints;
    var pixels = line.calculateClaimPixels(line.dt);
    // The ID is used in return value, so it's fetched right here 
    var id = this.pixels.indexByLine(line);
    //console.log("Claiming ",pixels.length," pixels.");
    if(line.drawing) {
      try {
        this.pixels.claimPixels(pixels, id);
      } catch(e) { 
        pixels.length = e.lastPixel+1; 
        return {pixels: pixels, dead: true, id: id};
        //this.gameOver(line);
        //console.log(e);
      }
    }
    else {
      return {pixels: [], dead: !this.pixels.pixelsAreFree(pixels), id: id};
    }
    return {pixels: pixels, dead: false, id: id};
  }
  LineGameMaster.prototype.stop = function() {
    this.gameLoop(false);
    this.emit("game.stopped");
  }
  
  function LineGameSlave() {
    LineGame.call(this, 0,0);
    var _this = this;
    this.on("game.init", function(x, y) {
      _this.width = x;
      _this.height = y;
      _this.init();
    });
    this.on("line.moved", function(id, params) {
      //console.log(params);
      _this.lineById(id).setPositionData(params);
    });    
    this.on("lines.moved", function(params) {
      //console.log(params);
      for(var i=0,l=params.length; i<l; i++) {
        _this.lineById(params[i][0]).setPositionData(params[i][1]);
      }
    }); 
    this.on("line.added", function(id, name, color, local) {
      _this.setLine(id, name, color, local);
    });
    this.on("pixels.changed", function(pixels) {
      //console.log(pixels);
      _this.pixelsChanged(pixels);
    });
    this.on("control.restart", function() {
      _this.pixels.reset();
    });
    this.on("line.removed", function(id) {
      _this.removeLine(id);
    });
    this.on("line.dead", function(id) {
      _this.killLine(id);      
    });
    this.on("line.changed", function(id, data) {
      _this.lineById(id).setProperties(data);  
    });
    this.on("lines.dead", function(ids) {
      ids.forEach(function(id) {_this.killLine(id);});      
    });
    this.on("lines.score.update.binary", function(data) {
      var data = new Uint32Array(data, 0, data.byteLength/4);
      var changed = false;
      //console.log(data);
      // First value is ID, second value is score 
      for(var i=0, l=data.length-1; i<l; i+=2) {
        var line = this.lineById(data[i]);
        if(line) {
          changed = changed||line.score!=data[i+1];
          line.score = data[i+1];
        }
      }  
      if(changed) {
        //console.log("Data changed!");
        this.emit("local.lines.score.update"); 
      } 
    });
    this.on("game.started", function(lines) {
      _this.resetLines(false);
      _this.running = true;
      _this.gameStartTime = performance.now();
      _this.pixels.reset();
      _this.playingLines = lines.map(function(id) {return _this.lineById(id);});
    });
    this.on("game.over", function(id) {
      _this.running = false;
    });
  }
  LineGameSlave.prototype = Object.create(LineGame.prototype);
  
  LineGameSlave.prototype.requireLine = function(name, color) {
    this.emit("line.requested", name, color);
  }
  
  LineGameSlave.prototype.pixelsChanged = function(newPixels) {
    for(var id in newPixels) {
      if(newPixels.hasOwnProperty(id)) {
        var line = this.lineById(id);
        //console.log("Claim lixels", id, line);
        this.pixels.claimPixels(newPixels[id], line, true);
      }  
    }
  }
  /** Convert list of changed pixels to array buffer: 
   *  Input:
   *  {
   *    <lineID: number>: 
   *    [
   *      [<x: number>, <y: number>],
   *      ...   
   *    ]      
   *
   *  }               
   *
   *
   *
   ***/
  function pointChangeListToArrayBuffer(pixels) {
  
  }
  
  /**
   * Randomize array element order in-place.
   * Using Durstenfeld shuffle algorithm.
   */
  function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
      return array;
  }
  return {
    Game: LineGame,
    Master: LineGameMaster,
    Slave: LineGameSlave
  }
});

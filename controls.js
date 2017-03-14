define(["eventemitter2", "keyCodes"], function(EventEmitter2, keyCodes) {
  
  function Controls() {
    EventEmitter2.call(this, {wildcard: false});
  }
  
  Controls.prototype = Object.create(EventEmitter2.prototype);
  Controls.prototype.keyAction = function(keyCode, callback) {
    this.on(keyCode, callback);
  }
  Controls.prototype.defineControl = function(keyCode, name) {
    var _this = this;
    this.on(keyCode, function(state) {_this.emit(name,state);});
  }
  Controls.prototype.setNamedKeyAction = function(keyName, callback) {
    var keyCode = keyCodes.KEY_NAMES[keyName];
    if(keyCode==null)
      throw new Error("Unknown key: "+keyName);
    this.on(keyCode, callback);
  }
  Controls.prototype.setNamedDebouncedKeyAction = function(keyName, callback) {
    var keyCode = Controls.nameToCode(keyName);
    var down = false;
    this.on(keyCode, function(state) {
      if(!down && state) {
        callback(state);
        down = true;
      }
      else if(!state)
        down = false;
    });
  }
  Controls.nameToCode = function(keyName) {
    var keyCode = keyCodes.KEY_NAMES[keyName];
    if(keyCode==null)
      throw new Error("Unknown key: "+keyName);
    return keyCode;
  }
  
  Controls.prototype.setLineControls = function(line, game, left, right) {
    new LineControls(line, game).listenOn(this, left, right);
  }
  Controls.prototype.setNamedLineControls = function(line, game, left, right) {
    new LineControls(line, game).listenOn(this, keyCodes.KEY_NAMES[left], keyCodes.KEY_NAMES[right]);
  }
  Controls.prototype.attach = function() {
    var _this = this;
    window.addEventListener("keydown", function(e) {
      if(!canProcessEvent(e))
        return true;
      if(_this.blockAll || _this.emit(e.keyCode, true)) {
        e.preventDefault();
      }
      if(_this.emitAllDown) {
        _this.getNextControlDown_end();
        _this.emit("keydown", e.keyCode); 
        e.preventDefault();
        return false;
      }
    });
    window.addEventListener("keyup", function(e) {
      if(!canProcessEvent(e))
        return true;
      if(_this.blockAll || _this.emit(e.keyCode, false)) {
        e.preventDefault();
      }
      if(_this.emitAllUp) {
        _this.getNextControlUp_end();
        _this.emit("keyup", e.keyCode);
        e.preventDefault();
        return false;
      }
    });
    // Prevents events from firing on input elements
    function canProcessEvent(e) {
      var src = e.target;
      if(src instanceof HTMLInputElement || src instanceof HTMLTextAreaElement) {
        return false;
      }    
      return true;
    }
  }
  Controls.prototype.getNextControlDown = function(callback, blockAll) {
    this.emitAllDown = true;
    if(blockAll===true)
      this.blockAll = true;
    this.once("keydown", callback);
  }
  Controls.prototype.ungetNextControlDown = function(callback) {
    this.getNextControlDown_end();
    this.removeListener("keydown", callback);
  }
  Controls.prototype.getNextControlDown_end = function() {
    this.emitAllDown = false;//this._events.keyup;
    this.blockAll = false;
  }
  Controls.prototype.getNextControlUp = function(callback, blockAll) {
    this.emitAllUp = true;
    if(blockAll===true)
      this.blockAll = true;
    this.once("keyup", callback);
  }
  Controls.prototype.ungetNextControlUp = function(callback) {
    this.getNextControlUp_end();
    this.removeListener("keyup", callback);
  }
  Controls.prototype.getNextControlUp_end = function() {
    this.emitAllUp = false;
    this.blockAll = false;
  }
  function LineControls(line, game) {
    this.lineID = line;
    this.game = game;
  }
  LineControls.prototype.listenOn = function(object, left, right) {
    var _this = this;
    object.on(left, listenerLeft);
    object.on(right, listenerRight);
    this.game.on("local.line.removed", removeCallback);
    function listenerLeft(state) {
      _this.game.emit("line.rotation", _this.lineID, state?1:0);
    }
    function listenerRight(state) {
      _this.game.emit("line.rotation", _this.lineID, state?-1:0);
    }
    function removeCallback(id) {
      if(id==_this.lineID) {
        object.removeListener(left,  listenerLeft);
        object.removeListener(right, listenerRight);
      }
    }
  }
  return Controls;
});
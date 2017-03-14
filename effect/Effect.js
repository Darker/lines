define(function() {
  //console.log("Effect");
  function Effect(line) {
    this.remove = this.remove.bind(this);
    this.source = null;
    this.line = line;  
  }
  Effect.prototype.applyEffect = function(line) {
    return this.line.addEffect(this);
    //throw new Error("Effect.apply must be implemented!");
  }
  Effect.prototype.removeEffect = function(line) {
    //this.line.effects.splice(line.effects.indexOf(this), 1);
    this.line.removeEffect(this);
  }
  Effect.prototype.destroy = function() {
    this.untimeout();
  }
  Effect.prototype.clone = function(line) {
    var clone = new this.constructor();
    clone.line = line||this.line;
    clone.source = this.source;
    if(this.cloneTo)
      this.cloneTo(clone);
    return clone;
  }
  Effect.prototype.imageURL = function() {
    return "image/effect/"+this.constructor.name+".png";
  }
  /** 
   * Removes the effect after specified delay. Any arguments after time will
   * be passed to .remove method of this object. 
   * Alternatively, full set of arguments to setTimeout may be passed
   * as first parameterr, but this is only supposed to be used internally. */     
  Effect.prototype.timeout = function(time) {
    if(this.timeoutID)
      return false;
    var args;
    if(typeof time=="number") {
      args = [this.remove];
      // Pushes timeout time and any other arguments
      args.push.apply(args, arguments);
    }
    else if(time instanceof Array) {
      args = time;
      time = args[1];
    }
    else
      throw new Error("Invalid arguments to Effect.prototype.timeout.");
    this.timeoutArgs = args;
    this.timeoutID = setTimeout.apply(null, args);
    this.timeoutEnd = new Date().getTime()+time;
  }
  Effect.prototype.untimeout = function() {
    if(this.timeoutID) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
      this.timeoutEnd = new Date().getTime();
    }
  }
  Object.defineProperty(Effect.prototype, "remainingTimeout", {
     get:  function() {
       return Math.max(this.timeoutEnd-new Date().getTime(),0);
     },
     set: function(val) {
       return this.replaceTimeout(val);
     }
  });
  Effect.prototype.addToTimeout = function(time) {
    // First calculate remaining timeout
    this.timeoutArgs[1] = this.remainingTimeout+time;
    console.log("Extending effect of ",this.constructor.name," to ",this.timeoutArgs[1],"ms from now.");
    // Then cancel timeout and start a new one
    this.untimeout();
    this.timeout(this.timeoutArgs);
  }
  Effect.prototype.replaceTimeout = function(time) {
    this.untimeout();
    this.timeoutArgs[1] = time;
    this.timeout(this.timeoutArgs);
  }
  Effect.prototype.stackable = true;

  return Effect;
});
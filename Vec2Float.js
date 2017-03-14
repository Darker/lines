define(["VecFunctions"], function(VecFunctions) {
  function Vec2Float(x,y) {
    this.vecCtor = Vec2Float;
    if((typeof x == "number") && (typeof y == "number")) {
      this[0] = x;
      this[1] = y;
    }
  }
  // Unfortunatelly I can't call this in constructor as I'm supposed to :(
  Vec2Float.prototype = new Float32Array(2);
  Object.defineProperty(Vec2Float.prototype, "x", {
    get: function() { return this[0]; },
    set: function(newValue) { this[0]=newValue; },
    enumerable: true
  });
  Object.defineProperty(Vec2Float.prototype, "y", {
    get: function() { return this[1]; },
    set: function(newValue) { this[1]=newValue; },
    enumerable: true
  });
  VecFunctions(Vec2Float);
  //Vec2Float.oninit = [];
  //Huge ammount of functions
  /*requirejs(["VecFunctions"], function(VecFunctions) {
    VecFunctions(Vec2Float);
    Vec2Float.oninit.map(function(callback) {callback(Vec2Float);});
    // Since onload, callbacks can be called instantly
    Vec2Float.oninit.push = function(callback) {callback(Vec2Float);};
  });   */
  return Vec2Float;
});
/*if(Vec2Float.fromArray==null)
  VecFunctions(Vec2Float);*/



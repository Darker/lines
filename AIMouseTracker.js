define(["AI", "Vec2Float"], function(AI, Vec2Float) {
  //console.log("Effect");
  function AIMouseTracker(game) {
    AI.apply(this, arguments);
    this.mouse = new Vec2Float(0,0);
    console.log("AIMouseTracker started.");
    var navigateCallback = function(e) {
      this.mouse.x = e.clientX-game.renderer.offsets[0];
      this.mouse.y = e.clientY-game.renderer.offsets[1];
    }.bind(this);
    var toutchCallback = function(e) {
      this.disabled = false;
      var t = e.touches[0];
      navigateCallback(t);
      console.log("Toutch:", [t.clientX, t.clientY], "Coords: ", this.mouse);
    }.bind(this);
    
    this.disabled = false;
    window.addEventListener("mousemove", navigateCallback);
    window.addEventListener("touchmove", toutchCallback);
    window.addEventListener("touchstart", toutchCallback);

    window.addEventListener("touchend", function() {
      console.log("Toutch end, disabling AI.");
      this.disabled = true;
    }.bind(this));
    game.on("lines.moved", this.callbacks["lines.moved"]=this.callCalculate.bind(this));
    // Do not listen on pixels change this time
    game.removeListener("pixels.changed", this.callbacks["pixels.changed"]);
  }
  AIMouseTracker.prototype = Object.create(AI.prototype);
  AIMouseTracker.prototype.calculate = function(pixels, line) {
    if(!this.disabled)
        this.goToPoint(this.mouse);
  }; 
  return AIMouseTracker;
});
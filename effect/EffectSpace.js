define(["effect/Effect"], function(Effect) {
  //console.log("EffectSpace");
  function EffectSpace(duration) {
    this.duration = typeof duration=="number"&&duration>0?Math.round(duration):280;
    Array.prototype.splice.call(arguments, 0, 1);
    Effect.apply(this, arguments);
  }
  EffectSpace.prototype = Object.create(Effect.prototype);
  EffectSpace.prototype.apply = function() {
    if(this.applyEffect()) {
      this.line.drawing = false;
      console.log("Effect dispatched for ",this.duration," miliseconds.");
      this.timeout(this.duration);
    }
    else
      console.log("Effect space failed.");
  }
  EffectSpace.prototype.stackTo = function(effect) {
    effect.addToTimeout(this.duration);
  }
  EffectSpace.prototype.remove = function() {
    this.removeEffect();
    this.line.drawing = true;
  }
  EffectSpace.prototype.stackable = false;
  EffectSpace.prototype.constructor = EffectSpace;
  return EffectSpace;
});
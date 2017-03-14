define(["effect/Effect", "effect/EffectSpace"], function(Effect) {
  //console.log(arguments);
  Array.prototype.forEach.call(arguments, function(ctor) {
    if(ctor==Effect)
      return;
    Effect[ctor.name] = ctor;
  });
  return Effect;
});

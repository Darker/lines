define(function() {
    if(typeof global == "object" && typeof window=="undefined") {
      requirejs(["performance-now"], function(p) {
        global.performance = {now: p};
      });
    }   
    function Spell(effect, line, cooldown) {
      this.lastCast = 0;
      this.effect = effect;
      this.caster = line;
      this.cooldown = cooldown;
    }
    Spell.prototype.cast = function() {
    
    }
    
    Spell.selector = {
      ALL: function() {
        return this.line.game.playingLines;
      },
      CASTER: {
        return this.line;
      },
      ENEMIES: {
        var line = this.line;
        return line.game.playingLines.filter(function(l) {l!=line});
      },
      CLOSEST: {
        var line = this.line;
        return [
          line.game.playingLines.reduce(
            function(cur, prev) {
              return cur.pen.distanceSq(line.pen)>prev.pen.distanceSq(line.pen)?cur:prev;
            }
          )
        ];
      }  
    }


});
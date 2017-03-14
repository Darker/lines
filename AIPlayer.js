define(["AI", "Vec2Float"], function(AI, Vec2Float) {
  //console.log("Effect");
  function AIPlayer(game) {
    AI.apply(this, arguments);
    if(game.renderer)
      game.renderer.registerRenderObject(this);
    this.redraw = false;
    this.points = [];
    // Increments until max value reached, then re-calculates coordinates
    this.sleep=99999999;
    
    game.on("lines.moved", this.callbacks["lines.moved"]=this.move.bind(this));
    //game.on("lines.moved", this.callCalculate.bind(this));
    // Do not listen on pixels change this time
    //game.removeListener("pixels.changed", this["callback_pixels.changed"]);
  }
  AIPlayer.prototype = Object.create(AI.prototype);
  AIPlayer.prototype.calculate = function(pixels, line) {
    // Allows bot to skip frames to save performance
    this.sleep++;
    if(this.sleep<0 && this.targetPoint) {
      this.goToPoint(this.targetPoint);
      return;
    }
    this.sleep = 0;
    this.redraw = false;
    

    // Clear list of points from last iteration
    this.points.length = 0;
    // Current pen, moved forward to avoid intersecting with itself
    var pen = line.pen.clone().moveByAngle((line.rotation/180)*Math.PI, 5);
    if(pen[0]<=0||pen[0]>=pixels.width||pen[1]<=0||pen[0]>=pixels.height)
      return;
    // Loop angles to find best target direction
    const alphaIteration = 10;
    for(var alpha=0; alpha<360; alpha+=alphaIteration) {
      var boundary = this.gameBoundaryAtAngle(-alpha, pen.clone()); 
      //console.log("Boundary line: "+pen+" -> "+boundary);      
      var points = line.constructor.straightPoints(Math.round(pen.x), Math.round(pen.y), Math.round(boundary.x), Math.round(boundary.y));
      //console.log("Points to check: ", points.length);
      if(points.length==0)
        continue;
      var point;
      var i=0;
      for(var l=points.length-1; i<l; i+=2) {
        if(i>=l-3 || !pixels.pixelIsFree(points[i], points[i+1])) {
          point=new Vec2Float(points[i], points[i+1]);
          break;
        }
      }
      

      // Use distance squared as we don't need exact value for comparison
      var dist = pen.distance(point);
      // First point already failed, that means we're deep in shit.
      if(dist<1.9 || i==0) {
        //console.log(alpha+"° Break point #"+i+": "+pen+"->"+point+" distance: "+dist+" Line direction: "+(line.rotation%360)+"°");
        //alpha-=alphaIteration-3;
        continue;
      }

      point.dist = dist; 
      point.alpha = alpha;
      //console.log(point.dist, point.alpha);
      if(this.points.length>0) {
        point.prew = this.points[this.points.length-1];
        point.prew.next = point;
      }

      this.points.push(point);
    }
    // If there are no point we don't look for the best...
    if(this.points.length==0) {
      if(this.targetPoint)
        points.push(this.targetPoint);
      return;    
    }
    else if(this.points.length==1) {
      this.points[0].awesome = true;
      this.targetPoint=this.points[0];
      return;
    }
    // Connect first and last point in array
    this.points[0].prew = this.points[this.points.length-1];
    this.points[0].prew.next = this.points[0];
    
    // Find the most suitable result
    var _this = this;
    var maxRating = 0;
    var best = this.points.reduce(function(prew, current) {
       var penalty = 0;
       if(_this.targetPoint) 
         penalty+=Vec2Float.rotationAngleAbs(current.alpha, _this.targetPoint.alpha)/1.4;//current.distanceSq(_this.targetPoint)/25;
       if(Vec2Float.rotationAngleAbs(line.rotation, current.alpha)<18) {
         penalty+=200;
       }                       
       current.rating = Math.max((current.dist*1.8+current.prew.dist+current.prew.prew.dist+current.next.dist+current.next.next.dist-penalty)/6,0);  
       if(current.rating>maxRating)
         maxRating = current.rating;
       //current.rating = current.dist;
       return prew.rating>current.rating?prew:current;
    });
    this.maxPointRating = maxRating;
    //console.log(best.alpha+"° Calculated best point: "+best+" dist: "+best.dist);
    best.awesome = true;
    this.targetPoint=best;
    this.goToPoint(this.targetPoint=best);
  }; 
  AIPlayer.prototype.move = function() {
    if(this.targetPoint)
      this.goToPoint(this.targetPoint);
  }
  AIPlayer.prototype.render = function(gr, off) { 
    if(this.line.dead || true)
      return;
    //console.log("Render ", this.points.length," points.");
    for(var i=0,l=this.points.length; i<l; i++) {
      var p = this.points[i];
      var p1 = this.line.pen.clone().moveByAngle((this.line.rotation/180)*Math.PI, 4);
      var relative_rating = p.rating/this.maxPointRating;
      var color;
      if(p.awesome)
        color=0xFFFFFF;
      else
        color = (Math.round(0xFF*(1-relative_rating/2))<<16)+(Math.round(0x00EE*(relative_rating))<<8);
      gr.lineStyle(1, color, 1);
      // draw a shape
      gr.moveTo(p1[0]+off[0], p1[1]+off[1]);
      gr.lineTo(p[0]+off[0], p[1]+off[1]);
      
    } 
    /**
     *for(var i=0; i<1.01; i+=0.05) {
  var relative_rating = i;
  var r = Math.round(0xFF*(1-relative_rating/2))<<16
  var g = Math.round(0x00EE*(relative_rating))<<8;
  var color = r;
  console.log(Math.round(i*100)+"% #"+("000000"+(color).toString(16)).substr(-6))
}**/    
    gr.lineStyle(0);
    this.redraw = false;
  }
  return AIPlayer;
});
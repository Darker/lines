define(["Vec2Float"], function(Vec2Float) {
  //console.log("Effect");
  function AI(game, line, calculate) {
    this.game = game;
    this.line = line;    
    this.callbacks = {};
    // Remember last direction for convenient usage with left(), right() and forward()
    this.lastDirection = 0;
    if(typeof calculate == "function")
      this.calculate = calculate;
    game.on("pixels.changed", this.callbacks["pixels.changed"] = this.callCalculate.bind(this));
    
    // Destroy AI when line is removed
    game.on("game.started", this.callbacks["game.started"]=function() {
      if(!game.lineExists(this.line)) {
        for(var i in this.callbacks) {
          if(typeof this.callbacks[i]=="function") {
            game.removeListener(i, this.callbacks[i]);
          }
        }
        console.log("AI destroyed.");
        delete this.game;
        delete this.line;
        delete this.callbacks;
      }
    }.bind(this));
  }
  AI.prototype.calculate = function() {throw new Error("Calculate not implemented.");};
  AI.prototype.callCalculate = function() {
    this.calculate(this.game.pixels, this.line);
  }
  AI.prototype.left = function() {
    this.direction(1);
  }
  AI.prototype.left = function() {
    this.direction(-1);
  }
  AI.prototype.forward = function() {
    this.direction(0);
  }
  AI.prototype.direction = function(d) {
    if(this.lastDirection!=d)
      this.game.emit("line.rotation", this.line.id, this.lastDirection = d);
  }
  /**
   * Turn to point on screen **/  
  AI.prototype.goToPoint = function(point, angleThreshold) {
    this.goToAngle(Vec2Float.fromPoints(this.line.pen, point).angleDeg());
    /*if(typeof angleThreshold=="undefined")
      angleThreshold = 10;
    var rotation_angle = this.angleToPoint(point);
    if(Math.abs(rotation_angle)>angleThreshold)
      // Normalize to -1,1
      this.direction(rotation_angle/Math.abs(rotation_angle));
    else
      return 0;  */
    //this.goToAngle(rotation_angle, angleThreshold);
  }
  /** Turn to reach given angle **/
  AI.prototype.goToAngle = function(angle, angleThreshold) {
    if(typeof angleThreshold=="undefined")
      angleThreshold = 10;
    angle = Vec2Float.reduceAngle(angle);
    var line_angle = Vec2Float.reduceAngle(this.line.rotation);
    // least of the calculations below is the correct turn angle
    var rotation_angle = minAbs(angle-line_angle,
                                angle-line_angle+360,
                                angle-line_angle-360); 
                                
    if(Math.abs(rotation_angle)>angleThreshold)
      // Normalize to -1,1
      this.direction(rotation_angle/Math.abs(rotation_angle));
    else
      return this.direction(0);
  }
  /** Calculate minimal angle between line and a point
   *  Turning by the minimal angle reaches the point fastest.
   *      **/
  AI.prototype.angleToPoint = function(point) {
    // Get vector from line location to point location
    var dir_vector_angle = Vec2Float.fromPoints(this.line.pen, point).angleDeg();   // T target angle
    var line_angle = Vec2Float.reduceAngle(this.line.rotation);                     // C current angle
    // least of the calculations below is the correct turn angle
    return minAbs(dir_vector_angle-line_angle,
                                dir_vector_angle-line_angle+360,
                                dir_vector_angle-line_angle-360); 
  }
  AI.prototype.rayCast = function() {
  
  }

  AI.prototype.gameBoundaryAtAngle = function(theta, point) {
    // reduce the theta  
    theta =  theta % 360; 
    // force it to be the positive remainder, so that 0 <= theta < 360  
    theta = (theta + 360) % 360;  
    // force into the minimum absolute value residue class, so that -180 < theta <= 180  
    if (theta > 180)  
        theta -= 360;  
    // Convert to radians
    theta = (theta * Math.PI / 180);
    // Get a rectangle that has width and height properties
    var rect = this.game.pixels;
    var width = rect.width;
    var height = rect.height;
    // If refference point wasn't provided as second argument
    //TODO: MAKE IT WORK WITH OTHER THAN RECTANGLE CENTRE POINT!
    if(typeof point=="undefined") {
      point = new Vec2Float(2);
      point[0] = width/2;
      point[1] = height/2;
    }
    // Here be mysterious math and stuff - all bellow explained here
    var a = width,
        b = height;
    // Calculate a and b
    var rectAtan;
    if(point[0]==a/2 && point[1]==b/2) {
      // nothing, a and be are correct
    }
    else {
      // If we're looking to the LEFT, we don't care
      // where right boundary is so assume the point is in middle
      if(theta>Math.PI/2 || theta<-Math.PI/2) {
        a = point[0]*2;
      }
      else {
        a = width*2-point[0]*2;
      }
      // If we're looking UP, we don't care where
      // bottom boundary is so assume the point is in middle
      if(theta>=0) {
        b = point[1]*2;
      }
      // If we're looking DOWN
      if(theta<0) {
        b = height*2-point[1]*2;
      }
      
      //Math.atan2(point1Y - fixedY, point1X - fixedX);
    }
    rectAtan = Math.atan2(b, a);
    
    var tanTheta = Math.tan(theta);
    // By default, region 1 and 3
    var region = true;
    
    var xFactor = 1;
    var yFactor = 1;
    
    if ((theta > -rectAtan) && (theta <= rectAtan)) {
        yFactor = -1;  // REGION 1
    } else if ((theta > rectAtan) && (theta <= (Math.PI - rectAtan))) {
        yFactor = -1;  // REGION 2
        region = false;
    } else if ((theta > (Math.PI - rectAtan)) || (theta <= -(Math.PI - rectAtan))) {
        xFactor = -1;  // REGION 3
    } else {
        xFactor = -1;  // REGION 4
        region = false;
    }

    // If region 1, 3
    if (region) {
      point[0] += xFactor * (/*width-point[0]*/a/2);                                     // "Z0"
      point[1] += yFactor * (/*width-point[0]*/a/2) * tanTheta;
    } else {
      point[0] += xFactor * (/*(height-point[1])*/(b/2) / tanTheta);                        // "Z1"
      point[1] += yFactor * /*(height-point[1])*/ (b/2);
    }
    return point;
  }
  
  
  /**
   * Select smallest number under absolute value, but return original
   * value with sign. Eg.:
   * for [5,-2,-10] returns -2 */       
  function minAbs() {
    var minIndex = 0,
        minValue = Number.MAX_VALUE;
    for(var i=0,l=arguments.length; i<l; i++) {
      var absval = Math.abs(arguments[i]);
      if(absval<minValue) {
        minIndex = i;
        minValue = absval;        
      }
    }
    return arguments[minIndex];    
  } 
  return AI;
});
define(["Vec2Float"], function(Vec2Float) {  
  if(typeof global == "object" && typeof window=="undefined") {
    requirejs(["performance-now"], function(p) {
      global.performance = {now: p};
    });
  }   

  function Line(name, color, game, id) {
    //This is the drawing location at this moment
    this.pen = new Vec2Float(0,0);
    this.lastPen = new Vec2Float(0,0);
    this.lastSentPen = new Vec2Float(0,0);
    this.initalPen = new Vec2Float(0,0);
    //Time of last step ised in conjunction with speed to calculate ammount of movement
    this.t = -1;
    this.rotation = 30;
    this.rotating = 0;    //Rotating can be one of [-1, 0, 1]
    this.rotationSpeed = 180;
    this.speed = 40;
  
    this.game = game;
  
    this.name = name;
    this.color = color;
    this.id = typeof id=="number"?id:Line.id++;
    // Indicates that the line is playing in current game
    this.moving = true;
    this.dead = false; 
    // indicates that the line is drawing (line can move without drawing)
    this.drawing = true;
    // List of active effects affecting the line behavior
    this.effects = [];
    // Indicates that the line want's to join future games
    this.active = true;
    // Used the remember whether line was controlled (eg. turned) 
    this.lastActivity = 0;
    // Score
    this.score = 0;
    
    //Set constructor
    this.constructor = Line;
    
  }
  Line.id = 0;
  Line.prototype.initPen = function(x,y) {
    this.lastSentPen[0]=this.initalPen[0]=this.pen[0]=this.lastPen[0]=x;
    this.lastSentPen[1]=this.initalPen[1]=this.pen[1]=this.lastPen[1]=y;
  }
  Line.prototype.getPositionData = function() {
    return {current: this.pen, inital: this.initalPen, rotation: this.rotation, speed: this.speed};
  }
  Line.prototype.setPositionData = function(data) {
    //console.log(this.pen, this.pen.copy);
    this.pen.copy(data.current);
    this.initalPen.copy(data.inital);
    this.rotation = data.rotation;
    this.speed = data.speed;
  }
  Line.prototype.setProperties = function(data) {
    if(data.positionData) {
      this.setPositionData(data.positionData);
    }
    for(var i in data) {
      if(this.hasOwnProperty(i))
        this[i] = data[i];
    }
  }
  Line.prototype.addEffect = function(effect) { 
    //Check if this kind of effect already is in the array
    if(!effect.stackable) {
      var existing;
      if(existing=this.findEffect(effect.constructor)) {
        effect.stackTo(existing);
        console.log("Merged effects "+effect.constructor.name);
        return false;
      }     
    }
    this.effects.push(effect);
    this.game.emit("line.effect.add", this.id, effect.constructor.name, effect.remainingTimeout);
    return true;
  }
  Line.prototype.findEffect = function(ctor) {
    return this.effects.find(function(e) {
      return e.constructor = ctor;
    });
  }
  Line.prototype.removeEffect = function(e) {
    this.effects.splice(this.effects.indexOf(e), 1);
    this.game.emit("line.effect.remove", this.id, e.constructor.name);
  }
  /** 
   * Checks if effect is applied on line. **/  
  Line.prototype.hasEffect = function(effectConstructor) {
    return this.findEffect(effectConstructor)!=null;//this.effects.indexOf(effectConstructor)!=-1;
  }
  Line.prototype.logActivity = function() {
    this.lastActivity = new Date().getTime();
  } 
  Line.prototype.logPenSent = function() {
    this.lastSentPen.copy(this.pen);
  }
  Line.prototype.penSentDistance = function() {
    return this.lastSentPen.distance(this.pen);
  }
  Line.prototype.getProperties = function(data) {
    var properties = {};
    properties.positionData = this.getPositionData();
    properties.active = this.active;
    properties.score = this.score;
    return properties;
  }

  /*Object.defineProperty(Line.prototype, 'rotating', {
    get: function() {
      return this.rotating;
    },
    set: function(val) {
      if(this.rotating!=val) {
        this.rotating = val;
        if(this.game)
          this.game.emit("rotatingChanged", this, val);
      }
    },
    configurable: false
  });*/
  
  Line.prototype.initFromRemoteData = function(data) {
    this.initPen(data.x, data.y);
    this.startCounting();
    this.rotating = data.rotating;
  }
  Line.prototype.reset = function() {
    this.t = -1;
    this.lastSentPen[0]=this.pen[0]=this.lastPen[0]=this.initalPen[0];
    this.lastSentPen[1]=this.pen[1]=this.lastPen[1]=this.initalPen[1];
    this.rotating = 0;
    this.moving = true;
    this.dead = false;
    this.drawing = true;
  }
  /**
   * Calculates how many pixels should be assigned in this run of the game
  **/ 
  Line.prototype.calculateClaimPixels = function(dt) {
    if(this.movePenRealtime(dt)) {
      try  {
        var points = Line.straightPoints(Math.round(this.lastPen[0]), Math.round(this.lastPen[1]), Math.round(this.pen[0]), Math.round(this.pen[1]));
        var sidePixels = [new Vec2Float(),new Vec2Float(), null, null];
        var distanceVector = [-this.lastPen[0]+this.pen[0], -this.lastPen[1]+this.pen[1]];
        var length = Math.sqrt(distanceVector[0]*distanceVector[0]+distanceVector[1]*distanceVector[1]);
        //console.log(length);
        if(length!=0) {
          /*var rotatedVector = new Vec2Float(distanceVector[1]/length, -distanceVector[0]/length);
          //rotatedVector.add(this.lastPen);
          console.log(this.lastPen+"", rotatedVector+"");
          rotatedVector.multiply(0.5);
          
          sidePixels[0][0] = Math.round((this.lastPen[0]+rotatedVector[0]));
          sidePixels[0][1] = Math.round((this.lastPen[1]+rotatedVector[1]));
          sidePixels[1][0] = Math.round((this.lastPen[0]-rotatedVector[0]));
          sidePixels[1][1] = Math.round((this.lastPen[1]-rotatedVector[1]));
          sidePixels[2] = sidePixels[0].cloneMoved(distanceVector);
          sidePixels[2].round();
          sidePixels[3] = sidePixels[1].cloneMoved(distanceVector);
          sidePixels[3].round();
          //console.log(sidePixels.join("\n"));
          //console.log(sidePixels+": ", this.pen[0],";",this.pen[1]);
          //console.log(this.lastPen[0],";",this.lastPen[1]);
          Line.straightPoints(sidePixels[0][0], sidePixels[0][1], sidePixels[2][0], sidePixels[2][1], points);
          Line.straightPoints(sidePixels[1][0], sidePixels[1][1], sidePixels[3][0], sidePixels[3][1], points);  */
          var morePoints = [];
          for(var i=0,l=points.length-1; i<l;i+=2) {
             for(var x=-1; x<2; x++) {
               for(var y=-1;y<2; y++) {
                 if((x!=0||y!=0) && (x==0||y==0)) {
                   morePoints.push(points[i]+x);
                   morePoints.push(points[i+1]+y);
                 }
               }
             }
          }
          points.push.apply(points, morePoints);
          
          Line.removeDuplicatePoints(points); 
          if(this.oldpoints!=null) {
            Line.removePoints(points, this.oldpoints);
          }
          //console.log("Old: ", this.oldpoints);
          //console.log("New: ", points);
          if(points.length>0)
            this.oldpoints = Object.create(points);
        }
    
        return points;
      }  catch(e) {
        console.log(e);
        return [];
      }
    }
    return [];
  }
  /**
    Moves pen based on time elapsed. Returns true if the pen was moved
  **/
  Line.prototype.movePenRealtime = function(dt) {
    dt /= 1000;
  
    var speed = this.speed*dt;
    //console.log(speed, dt);
    if(speed<2.5)
      return false;
    this.t = performance.now();
    
    if(this.rotating!=0) {
      this.rotation+=dt*this.rotationSpeed*this.rotating;
    }
    this.movePen(speed);
    return true;
  }
  Line.prototype.movePen = function(distance) {
    this.lastPen[0] = this.pen[0];
    this.lastPen[1] = this.pen[1];
    
    var rad = (this.rotation/180)*Math.PI;
    this.pen[0] += distance*Math.cos(rad);
    this.pen[1] += distance*Math.sin(rad);
  }
  
  Object.defineProperty(Line.prototype, 'dt', {
    get: function() {
      var t = performance.now();
      if(this.t==-1) {
        //this.t=t;
        return 0;
      }
      var delta = t-this.t;
      //this.t = t;
      return delta;
    },
    configurable: false,
  });
  /**
   *  Start counting time for delta time calculation **/
  Line.prototype.startCounting = function() {
    this.t=performance.now();
  }
  
  /**
   * Returns array of points that form line between x1,y1 and x2,y2. The array looks like this:
   *  [x,y,x,y,x,y...]
  **/   
  Line.straightPoints = function(x1,y1,x2,y2, result) {
    if(!(result instanceof Array))
      result = [];
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    // First coordinates are not being added - it's assumed they were added in the last
    // iteration
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      result.push(x1);
      result.push(y1);
    }
    // Return the result
    return result;
  }
  //Line.removeDuplicatePoints([1,1,2,2,3,3,1,1,1,1,2,2]);
  Line.removeDuplicatePoints = function(array) {
    var len = array.length-1;
    for(var i=0;i<len;i+=2) {
      for(var j=i+2;j<len; j+=2) {
        if(array[i]==array[j] && array[i+1]==array[j+1]) {
          array.splice(j, 2);
          len-=2;
          j-=2;
          //break;
        }
      }
    }
    return array;
  }
  Line.removePoints = function(array, points) {
    var len = array.length-1;
    var len2 = points.length-1;
    for(var i=0;i<len2;i+=2) {
      for(var j=0;j<len; j+=2) {
        if(array[j]==points[i] && array[j+1]==points[i+1]) {
          array.splice(j, 2);
          len-=2;
          j-=2;
          //break;
        }
      }
    }
    return array;
  }
  return Line;
});
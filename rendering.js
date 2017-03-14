
define(["pixi.min", "text!shader.txt"], function(PIXI, shader) {

  function GameRenderer(game, width, height) {
    this.renderer = PIXI.autoDetectRenderer(this.width=width, this.height=height,{backgroundColor : 0x000000});
    this.game = game;
    //How far to offset playing zone from [0,0];
    this.offsets = [0,0];
    this.pixels = [];
    this.forcerender = false;
    
    
    // Allow redraw when line moves
    if(this.game) {
      game.on("line.moved", this.invalidateGraphics.bind(this));
      game.on("lines.moved", this.invalidateGraphics.bind(this));
    }
  }
  
  
  GameRenderer.prototype.init = function(parentElement) {
    document.body.appendChild(this.renderer.view);
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
  
    this.graphics = new PIXI.Graphics();
    
    var _this = this;
    
    var graphics = this.frame = new PIXI.Graphics();
    // set a fill and line style
    graphics.beginFill(0x0000);
    graphics.lineStyle(4, 0xffFFFF, 1);
    
    // draw a shape
    graphics.moveTo(0,0);
    graphics.lineTo(this.width, 0);
    graphics.lineTo(this.width, this.height);
    graphics.lineTo(0, this.height);
    graphics.endFill();
    this.stage.addChild(graphics);
    
    this.gameMap = new PIXI.Graphics();
    /*this.gameMap.filters = [
      new GameShader(shader)
    ];  */
   
    
    var _this = this;
    window.addEventListener("resize", function() {
      //console.log("RESIZE");
      _this.renderer.resize(_this.width=window.innerWidth, _this.height=window.innerHeight);
      if(_this.useCentering) 
        _this.center();
    });
    function followLines() {
      // handle small screens
      if(_this.game.lines.length>0 && (_this.gameWidth>_this.width || _this.gameHeight>_this.height)) {
        var centroid = _this.game.linesCentroid(true);
        //console.log("centering on ", centroid);
        _this.centerOn(centroid[0], centroid[1]);
      } 
    }
    this.game.on("line.moved", followLines);
    this.game.on("lines.moved", followLines);
  }
  GameRenderer.prototype.addPixels = function(pixels) {
    this.pixels.push(pixels);
    //Only runs when first pixels were added
    if(this.pixels.length==1) {
      this.gameWidth = pixels.width;
      this.gameHeight = pixels.height;
    }
  }
  GameRenderer.prototype.registerRenderObject = function(object) {
    this.morerender = object;
  } 
  GameRenderer.prototype.drawGameField = function() {
    if(this.gameWidth==0||this.gameHeight==0)
      return console.warn("Drawing game field before adding pixels!");
      
    var graphics = this.frame;
    this.stage.removeChild(graphics);
    graphics.clear();
    
    // set a fill and line style
    graphics.beginFill(0x000516);
    graphics.lineStyle(1, 0xffFFFF, 1);
    
    // draw a shape
    graphics.moveTo(/*this.offsets[0]*/-1,/*this.offsets[1]*/-1);
    graphics.lineTo(this.gameWidth+/*this.offsets[0]*/+2, /*this.offsets[1]*/-1);
    graphics.lineTo(this.gameWidth+/*this.offsets[0]*/+2, this.gameHeight+/*this.offsets[1]*/+2);
    graphics.lineTo(/*this.offsets[0]*/-1,  this.gameHeight+/*this.offsets[1]*/+2);
    graphics.endFill();
    this.stage.addChild(graphics);
    this.gameFieldDrawn = true;
  }
  GameRenderer.prototype.clearPixels = function() {
    this.pixels.length = 0;
  }
  GameRenderer.prototype.invalidateGraphics = function() {
    this.forcerender = true;
  }
  GameRenderer.prototype.pixelsOffset = function(x,y) {
    this.offsets[0]=x;
    this.offsets[1]=y;
    this.frame.x = x;
    this.frame.y = y;
    this.gameMap.x = x;
    this.gameMap.y = y;
    this.forcerender = true;
    this.gameFieldDrawn = false;
  }
  GameRenderer.prototype.center = function() {
    this.pixelsOffset(Math.round(this.width/2-this.gameWidth/2), 
                      Math.round(this.height/2-this.gameHeight/2)
    );
    this.useCentering = true;
  }
  GameRenderer.prototype.centerOn = function(x,y) {
    this.pixelsOffset(Math.round(this.width/2-x), 
                      Math.round(this.height/2-y)
    );
    this.useCentering = true;
  }
  GameRenderer.prototype.startRendering = function() {
    //Do not start multiple rendering chains
    if(this.rendering)
      return;
    //Set up rendering lock
    this.rendering = true;
    var _this = this;
    // run the render loop
    animate();
    function animate() {
      // Draw pixel grids over each other (currently, only one exists at a time) 
      if(_this.pixels!=null)
        _this.drawPixels();
      _this.renderer.render(_this.stage);
      //This check shouldn't be necessary as rendering is synchronous but you never know...
      if(_this.rendering)
        requestAnimationFrame(animate);
    }
  }
  /**
   * Draws all pixel grids on screen.
   **/
  GameRenderer.prototype.drawPixels = function() {
    var gr = this.gameMap;
    var redrawn = false;
    var _this = this;
    // Testing with filter
    //gr.filters[0].uniforms.customUniform.value += 0.01;
    // Ensure game field is drawn
    if(!this.gameFieldDrawn) {
      this.drawGameField();
    }
  
    function redrawStart() {
      if(!redrawn) {
        //When I didn't remove the map every time, it didn't update
        _this.stage.removeChild(gr);
        gr.clear(); 
        
        // Extra render
        if(_this.morerender) {
          _this.morerender.render(gr, _this.offsets);
          //console.log(_this.morerender);
        }
        gr.lineStyle(0);

        // Draw line pointers
        if( _this.game.playingLines && _this.game.playingLines.length>0 )
          _this.game.playingLines.forEach(function(line) {
            gr.beginFill(line.color, 0.5);
            gr.drawCircle(line.pen[0], line.pen[1], 1.5);
            gr.endFill();
            // Also draw the final point
            /*gr.beginFill(0xFF0000, 1);
            var target = boudaryatangle.call(_this, -line.rotation, line.pen.clone());            
            gr.drawCircle(target[0], target[1], 3);
            gr.endFill(); */  
        });     
        /*gr.beginFill(0xFF0000, 1);
        for(var angle=0; angle<360; angle+=45) {
          var target = boudaryatangle.call(_this, angle);
          gr.drawCircle(target.x+_this.offsets[0], target.y+_this.offsets[1], 3);
        }
        gr.endFill();     */
        redrawn = true;
      }
    }
    var lineColorCache;
    //Every pixel array will be rendered
    for(var i=0,l=this.pixels.length; i<l; i++) {
      var px = this.pixels[i];
      if(!px.hasChanged() && !this.forcerender)
        continue;
      console.info("Redraw!");
      redrawStart();
      lineColorCache = {};
      var ar = px.array;
      var w = px.width;
      var h = px.height;
      // Classic X/Y loop below
      for(var y=0,yl=h; y<yl; y++) {
        for(var x=0,xl=w; x<xl; x++) {
          var pos = y*yl + x;
          // Non zero pixels are occupied
          if(ar[pos]!=0) {
            var line_id = ar[pos];
            gr.beginFill(
              lineColorCache[line_id] || (lineColorCache[line_id]=px.lineByIndex(line_id).color),
              1);
            gr.drawRect(x, y, 1, 1);
          }
        }
      } 
      /*for(var y=0,yl=px.length; y<yl; y++) {
        var r = px[y];
        //If pixel row is empty it is undefined
        if(r!=undefined) {
          //console.log("Checking row.");
          for(var x=0,xl=r.length; x<xl; x++) {
            // Non zero pixels are occupied
            if(r[x]!=0) {
              gr.beginFill(
                lineColorCache[r[x]] || (lineColorCache[r[x]]=px.lineByIndex(r[x]).color),
                1);
              gr.drawRect(x, y, 1, 1);
            }
          }
        }
      } */
    }

    
    if(redrawn) {
      _this.stage.addChild(_this.gameMap);
      this.forcerender = false;
    }
  }
  GameRenderer.prototype.drawPlayerList = function() {
    var list = this.game.lines;
    if(!this._playerListTable) {
      var tbody = this.playerListTableBody;
      tbody.innerHTML = "";
      var trlocal, trremote, trnobody;
      tbody.appendChild(mktr([
          mktd("", "placeholder"),
          mktd("Player list", "all_players", "th")
            .attrSet("colspan", "99") ]
        )
      );
      tbody.appendChild(trnobody=mktr([
          mktd("", "placeholder"),
          mktd("...nobody online...", "no_players")
            .attrSet("colspan", "99")]
        )
        .styleSet("display", list.length>0?"none":"")
      );
  
      tbody.appendChild(trlocal=mktr([
          mktd("", "placeholder"),
          mktd("Local players", "local_players playerlist", "th")
            .attrSet("id", "local_players")
            .attrSet("colspan", "99")] 
        )
        .styleSet("display", "none")
      );
      tbody.appendChild(trremote=mktr([
          mktd("", "placeholder"),
          mktd("Remote players", "remote_players playerlist", "th")
            .attrSet("id", "remote_players")
            .attrSet("colspan", "99")]
        )
        .styleSet("display", "none")
      );
      var _this = this;

      function addLine(line) {
        var row;
        if(typeof line!="object") {
          line = _this.game.lineById(line);
        }
        
        if((row=document.getElementById("list_line_"+line.id))==null) {
          // hide the nobody indicator
          trnobody.style.display = "none";
          console.log("Add line...");
          row = _this.createLineRowImage(line);
          if(line.local) {
            tbody.insertBefore(row, trremote);
            trlocal.style.display = "";
          } else {
            tbody.appendChild(row);
            trremote.style.display = "";
          }
        }
        return row;
      }
      function updateLinesStyle() {
        this.lines.forEach(updateLine);
      }
      function updateLinesScore() {
        this.lines.forEach(updateLineScore);
      }
      function updateLine(line) {
        var row = addLine(line);
        var classNames = ["line"];
        if(line.dead)
          classNames.push("dead");
        if(_this.game.running && !line.dead)
          classNames.push("playing");
        if(line.active)
          classNames.push("active");
        if(line.local)
          classNames.push("local");
        row.className = classNames.join(" ");
        
        $(row).find(".score").text(line.score);
      } 
      function updateLineScore(line) {
        var row = addLine(line);
        $(row).find(".score").text(line.score);
      }
      function removeLine(id) {
        console.log('Removing line ', id);
        if(id.id!=null) {
          console.trace();
          id = id.id;
        }
        tbody.removeChild(document.getElementById("list_line_"+id));
        if(game.lines.length==0) {
          trnobody.style.display = "";
          trlocal.style.display = "none";
          trremote.style.display = "none";
        }
      }
      function addEffect(id, name, timeout) {
        var div = _this.createEffectDiv(name);
        var row = addLine(id);
        row.cells[0].appendChild(div);
      }    
      function removeEffect(id, name) {
        var row = addLine(id);
        var div = $(row).find("div.effect."+name)[0];
        div.parentNode.removeChild(div);
      }
      updateLinesStyle.call(this.game);
      // Assign events
      //this.game.on("local.line.added", addLine);
      this.game.on("local.line.removed", removeLine);
      this.game.on("game.started", updateLinesStyle);
      this.game.on("game.over", updateLinesStyle);
      this.game.on("local.lines.changed", updateLinesStyle);
      this.game.on("local.lines.score.update", updateLinesScore);
      this.game.on("local.line.activated", updateLine);
      this.game.on("line.effect.add", addEffect);
      this.game.on("line.effect.remove", removeEffect);
    }

  }
  GameRenderer.prototype.drawPlayerListFilter = function(list, tbody, filter, firstTime) {
    var triggered = false;
    list.forEach(function(line) {
      if(filter(line)) {
        if(!triggered) {
          triggered = true;
          firstTime();      
        }
        tbody.appendChild(this.createLineRowImage(line));
      } 
    }.bind(this)); 
  }
  GameRenderer.prototype.createLineRowImage = function(line) {
    var effects, icon, icon_button, name, scoreText;
    var tr = mktr(
        [
        effects=mktd("", "effects"),
        icon=mktd(icon_button=this.createLineRowActivityButton(line), "icon"),
        name=mktd(new Text(line.name), "name")
          .styleSet("color", int2cssColor(line.color))
          .attrSet("id", "list_line_"+line.id+"_name"),
        scoreText = mktd(new Text("000000"), "score")
                   
        ],
        "line"
      )
      .attrSet("id", "list_line_"+line.id); 

    requirejs(["jquery-ui.min"], function() {
      $(icon).tooltip({content: function() {
          return $(tr).hasClass("active")?"This player will participate in next game":
                                          "This player opted out of joining games.";
        },
        items: "td"
      });
    });
    requirejs(["CounterAnimation"], function(CounterAnimation) {
      var animation = new CounterAnimation(scoreText, 10, {
        formater: function(num) {
            return ("000000"+Math.round(num)).substr(-6);
          }
      });
      animation.observe();
      /*animation.cssApplicator = function(s, c, f, animating) {
        if(animating)
          $(this).addClass("animating");
        else
      }    */
    });
    return tr;
  }
  GameRenderer.prototype.createLineRowActivityButton = function(line) {
    var button = document.createElement("div");
    if(line.local) {
      var _this = this;
      button.addEventListener("click", function() {
        _this.game.activateLine(line);
      });
    }
    return button;
  }
  GameRenderer.effectTooltips = {
      EffectSpace: "This player doesn't leave any trace on the game field."
  }
  GameRenderer.prototype.createEffectDiv = function(name) {
    var button = document.createElement("div");
    button.style.backgroundImage = "url('image/effect/"+name+".png')";
    button.className = "effect "+name;
    if(GameRenderer.effectTooltips[name]) {
      $(button).tooltip({content: GameRenderer.effectTooltips[name],items: "div"});
    }
    return button;
  }
  Object.defineProperty(GameRenderer.prototype, "playerListTable", {
    enumerable: true,
    get: function() {
      if(this._playerListTable==null) {
        this._playerListTable = document.createElement("table");
        this._playerListTable.appendChild(document.createElement("tbody"));
        this._playerListTable.className = "player_list";
        document.body.appendChild(this._playerListTable);
      }
      return this._playerListTable;  
    }
  });
  Object.defineProperty(GameRenderer.prototype, "playerListTableBody", {
    enumerable: true,
    get: function() {
      return this.playerListTable.tBodies[0];
    }
  });
  
  function GameShader(fragmentSource)
  {
      PIXI.AbstractFilter.call(this,
          // vertex shader
          null,
          // fragment shader
          fragmentSource,
          // set the uniforms
          {
              customUniform : {type : '1f', value : 5}
          }
      );
  }
  GameShader.prototype = Object.create(PIXI.AbstractFilter.prototype);
  GameShader.prototype.constructor = GameShader;
  GameRenderer.GameShader = GameShader;
  
  function mktr(cells, className) {
    var row = document.createElement("tr");
    if(cells instanceof HTMLElement) 
      row.appendChild(cells);
    else 
      for(var i=0,l=cells.length; i<l; i++) {
        row.appendChild(cells[i]);
      }
    row.className = className||"";
    chainableSetters(row);
    return row;
  }
  function mktd(html, className, tag) {
    var td = document.createElement(tag||"td");
    if(typeof html=="string") 
      td.innerHTML = html;
    else if(html instanceof HTMLElement || html instanceof Text) {
      td.appendChild(html);
    }
    td.className = className || "";
    chainableSetters(td);
    return td;
  }
  function chainableSetters(obj) {
    obj.attrSet = function(name, value) {
      this.setAttribute(name, value);
      return this;
    }
    obj.styleSet = function(name, value) {
      this.style[name]=value;
      return this;
    }
    obj.propSet = function(name, value) {
      this[name]=value;
      return this;
    }
  }
  function int2cssColor(number) {
    if(number==null) {
      console.trace();
      return "#FFFFFF";
    }
    return "#"+("000000"+(number).toString(16)).substr(-6);
  }
  function boudaryatangle(theta, point) {
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
      point = new Float32Array(2);
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

  return GameRenderer;
});
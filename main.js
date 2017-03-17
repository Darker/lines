/*    at GameEventProxy.eventReceived (/home/ubuntu/workspace/eventproxy.js:16:22)                                                                       
    at SocketEventCon.parseEvent (/home/ubuntu/workspace/eventproxy.js:234:24)                                                                         
    at Socket.io.on.evtList (/home/ubuntu/workspace/eventproxy.js:184:15)                                                                              
    at emitTwo (events.js:87:13)                                                                                                                       
    at Socket.emit (events.js:172:7)                                                                                                                   
/home/ubuntu/workspace/eventproxy.js:255                                                                                                               
    if(this.outputFilters.checkAll(this, this.eventSink.game, name, args)) {                                                                           
                         ^                                                                                                                             
                                                                                                                                                       
TypeError: Cannot read property 'checkAll' of undefined                                                                                                
    at SocketEventCon.eventSend (/home/ubuntu/workspace/eventproxy.js:255:26)                                                                          
    at SocketEventCon.parseEvent (/home/ubuntu/workspace/eventproxy.js:239:14)                                                                         
    at Socket.io.on.evtList (/home/ubuntu/workspace/eventproxy.js:184:15)                                                                              
    at emitTwo (events.js:87:13)                                                                                                                       
    at Socket.emit (events.js:172:7)                                                                                                                   
    at /home/ubuntu/workspace/node_modules/socket.io/lib/socket.js:503:12                                                                              
    at nextTickCallbackWith0Args (node.js:436:9)                                                                                                       
    at process._tickCallback (node.js:365:13) */    

requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '.',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: [
            '//code.jquery.com/jquery-2.1.4.min',
            //If the CDN location fails, load from this location
            'jquery'
        ],
        "socket.io": [
            "//cdn.socket.io/socket.io-1.3.7",
            "socket.io.backup"
        ]
    },
    waitSeconds: 20   
});

requirejs.onError = function(error) {
  if(error.requireModules)
    error.requireModules.forEach(function(name) {
      //Create basename in case this was an URL
      name.replace(/^.*[/]/, "");
      // Debug
      console.warn("Module failed to load: ", name);
      notifyInit(name, false);
      // Find the loading node (they are hardcoded) and 
      // if it exists mark it as failed
      var element = document.getElementById("loading_"+name);
      if(element) {
        element.className+=" failed";
      }
    });
  else
    console.error("Unexpected requirejs onError callback: ", error);
}
function notifyInit(name, state) {
  document.querySelector("li."+name).className+=state?" success":" failure";
  // Hide popup if all has been loaded
  if(document.querySelectorAll("#initializing li").length<=document.querySelectorAll("#initializing li.success").length) {
      // If everything is loaded, jQuery is loaded too
      $("#initializing").hide();
  }
}
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)))
  isMobile = true;

var deps = ['game', 'eventproxy', 'controls', 'rendering', "async", "eventfilters", "socket.io", "lines_settings"];
if (!Array.prototype.find) {
  deps.push("polyfill/array.find");
}
// Start the main app logic.
requirejs(deps,
function(Game, EventProxy, Controls, GameRenderer, async, Filters, io, settings) {
      // Notify about initialization
      notifyInit("Game", true);
      // Mobile users can only create one line
      if(isMobile) {
        settings.max_lines = 1;
      }
      // Create game
      var gameSlave = self.game = new Game.Slave();
      gameSlave.name = "SLAVE "; 
      window.dispatchEvent(new Event("game.created"));
      window.async = async;
      window.settings = settings;
      /** SINGLE THREADED **/ /*
      var game = new LineGameMaster(500, 500);
      game.name =  "MASTER";
      var con1 = GameEventProxy.connectUsing(game, PlainEventCon);
      var con2 = GameEventProxy.connectUsing(gameSlave, PlainEventCon);
      con1.connect(con2);
             
      game.init();    */
      /** MULTI-THREADED **/
      /*var con = EventProxy.connectUsing(gameSlave, EventProxy.WorkerEventCon); 
      var wrk = new Worker("gameWorker.js");
      con.setWorker(wrk); */
      /** SOCKET.IO **/
      var con = self.connection = EventProxy.connectUsing(gameSlave, EventProxy.SocketEventCon); 
      con.server = false;
      con.settings = settings;
      Filters.out.pushToTarget(con, "inputFilters");
      Filters.in.pushToTarget(con, "outputFilters");
      
      var socket = self.socket = io(location.hostname+":"+location.port);
      //console.log("Connecting to "+location.hostname+":"+location.port);
      con.setSocket(socket);
      socket.on("connect", function() {
        if(window.$)
          $("#newPlayer").slideDown(300);
        else
          document.getElementById("newPlayer").style.display = "";
      })
      /*socket.on("errorMessage", function(error) {
          alert("Error from server:\n"+error);
      }); */
      RegisterBootboxDialogs(socket, game);
      socket.on("disconnect", function() {
          //console.log("dced");
          game.running = false;
          $("#newPlayer").slideUp(300);
          screenMessage("Disconnected. Trying to reconnect...", {
            event: {object:socket, name: "reconnect"},
            className: "socketDisconnected"
          });
      });
      
      /** GAME SLAVE CODE BELOW **/
      var renderer = window.renderer = new GameRenderer(gameSlave, window.innerWidth, window.innerHeight);
      renderer.init(document.body);
      gameSlave.setRenderer(renderer);
      
      
      socket.emit("client.ready");
      
      gameSlave.on("game.over", function(lines) {
        var message;
        if(lines.length == 1) {
          message = "Player "+game.lineById(lines[0]).name+" won!";
        }
        else if(lines.length>0) {
          var names = lines.map(function(x) {return game.lineById(x).name});
          names = names.join(", ").replace(/, ([^,]+)$/, " and $1");
          message = "Players "+names+" won!";
        }
        else if(game.playingLines.length==1 && game.localLines.indexOf(game.playingLines[0])!=-1) 
            message = "You survived for "+Math.round(((performance.now()-game.gameStartTime)/1000)*2)/2+" seconds!";
        else if(game.playingLines.length>1 && game.localLines.find(function(line) {return line.active;}))
            message = "Nobody survived!";
            
        if(typeof message=="undefined") {
          return;
        }
        //message +="<p class=\"small_note\">Press SPACE to play again.</p>";
        message +=" Press SPACE to play again.";
        screenMessage(message,4000);
      });
      gameSlave.on("game.started", function() {
        screenMessage();
      });
      var controls = window.controls = new Controls();
      //controls.setNamedKeyAction("r", function() {gameSlave.emit("control.restart");});
      function startgame() {
        if(gameSlave.activeLineCount()>0 && !game.running)
          gameSlave.emit("control.start");
      };
      controls.setNamedDebouncedKeyAction("space", startgame)
      controls.setNamedDebouncedKeyAction("esc", function() {screenMessage();});
      //controls.setNamedLineControls(gameSlave.lines[0].id, gameSlave, "right", "left");  
      controls.attach();
      // Mobile phone - start by double tap
      if(isMobile)
        document.body.addEventListener("dblclick", startgame);
      
      function screenMessage(string, options) {
        if(typeof options=="number") {
          options = {timeout: options};
        }
        else if(options==null) {
          options = {};
        }
        
        clearHideCallbacks();
        
        if(string==null || string.length==0) { 
          if(window.$) 
            $("#anouncement_container").fadeOut(800, function() {
              document.getElementById("anouncement").className = "";
            });
          else {
            document.getElementById("anouncement_container").style.display = "none";
            document.getElementById("anouncement").className = "";
          }
          return;
        }
        if(window.$)
          $("#anouncement_container").fadeIn(500);
        else  
          document.getElementById("anouncement_container").style.display = "";
          
        if(options.className)
            document.getElementById("anouncement").className = options.className;
        //Change or create text
        if(screenMessage.textNode==null) {
          var t = screenMessage.textNode = new Text(string);
          document.getElementById("anouncement").appendChild(t);
        }
        else {
          screenMessage.textNode.data = string;
        }
        if(typeof options.timeout=="number") {
          screenMessage.timeout = setTimeout(screenMessage, options.timeout);
        }
        if(options.event) {
          var callback = options.event.callback;
          options.event.object.once(options.event.name, 
                                  typeof callback=="function"?
                                    function() {
                                      if(callback.apply(this, arguments))
                                        screenMessage();
                                    }
                                    : 
                                    function() {screenMessage();}
          );
        }
        
        function clearHideCallbacks() {
          // If message is being hidden on timeout, stop that timeout
          if(screenMessage.timeout!=null)
            clearTimeout(screenMessage.timeout);
          if(screenMessage.events) {
            screenMessage.events.forEach(function(event) {
              event.object.removeListener(event.name, event.callback);
            });
            screenMessage.events.length = 0;
          }
        }
      }
      screenMessage.events = [];
      window.screenMessage = screenMessage;
});
function ADDAi(callback) {
  if(!game) {
    if(typeof callback=="function")
      callback(new Error("game not initialized yet!"));
    return console.error("game not initialized yet!");
  }
  requirejs(["AIPlayer"], function(AIMouseTracker) {
    var cb;
    var declcb;
    game.on("local.line.added", cb=function(line) {
      if(line.local) {
        game.removeListener("local.line.added", cb);
        game.removeListener("clientonly.msg.lineDeclined", declcb);
        var ai = new AIMouseTracker(game, line);
        if(typeof callback=="function")
          callback(ai);
        else if(typeof callback=="number"&&callback>1) {
          ADDAi(callback-1);
        }
      }
    });
    //game.on("game.over", function() {setTimeout(function() {game.emit("control.start");}, 1000);})
    game.once("clientonly.msg.lineDeclined", declcb=function(error) {
      game.removeListener("local.line.added", cb);
      console.error("Cannot add ai: "+error);
      if(typeof callback=="function")
        callback(new Error("Cannot add ai: "+error));
    });
    game.emit("line.requested", "AI_"+Math.round(Math.random()*66666), Math.random()*0xFFFFFF);
  });
}

requirejs(["jquery"], function() {
  notifyInit("jQuery", true);
  /**
   * New player notifier
  **/ 
  var new_player_notifier = setInterval(function() {      
    $("button.plus").toggleClass("emphasize");
    setTimeout(function() {$("button.plus").toggleClass("emphasize");}, 400);
  }, 800);
  function resetPlayerForm() {
    $("#playerName").val("Player "+(game.lines.length+1))
    $("#playerColor").val("#"+("000000"+(Math.round(Math.random()*0xFFFFFF)).toString(16)).substr(-6));  
    formWasOnceReset = true;
  }
  window.resetPlayerForm = resetPlayerForm;
  var formWasOnceReset = false;
  $("#newPlayer button.plus").click(window.AddNewPayerButton = function(evt, reset) {
    clearInterval(new_player_notifier);
    // Uppon click, the button tries to hide
    if(evt) {
      $(this).slideUp(100, 
        function() {
          if(game.localLines.length<settings.max_lines) {
            $("#newPlayer span").slideDown(100);
          }
        }
      );
    }
    // If called otherwise the button tries to appear and hides the form
    else {
      var _this = this;
      $("#newPlayer span").slideUp(100, 
        function() {
          if(game.localLines.length<settings.max_lines)
            $(_this).slideDown(100);
        }
      );
    }
    // can reset form to new state
    if(reset || !formWasOnceReset) {
      resetPlayerForm();
    }
  }.bind($("#newPlayer button.plus")[0])
  );
 
  //console.log($("#newPlayerOk"));
  $("#newPlayerOk").click(function() {
    $("#newPlayer span").slideUp(100);
    if(window.controlQueue == null) {
      window.controlQueue = [];
    }
    // Get controls MUST be called before `line.requested` so that it can catch
    // fail event if `line.requested` isn't succesful and abort controls dialog
    if(!isMobile) 
      getControls();
    else {
      function announceMobileControls(line) {
        if(line.local) {
          game.removeListener("local.line.added", announceMobileControls);
          screenMessage("Tap screen to navigate line.");
          console.log("Waiting for AI.");
          requirejs(["AIMouseTracker"], function(AIMouseTracker) {
            console.log("Starting AI");
            var ai = new AIMouseTracker(game, line);
            ai.disabled = true;
            window.mouse_ai = ai;
          });
        }
      }
      game.on("local.line.added", announceMobileControls);
    }
      
    window.game.emit("line.requested", $("#playerName").val(), parseInt($("#playerColor").val().substr(1), 16));
  });
  function PreparedControls(game, controls, queue) {
    this.left = null;
    this.right = null;
    this.lineID = null;
    
    this.controls = controls || null;
    this.game = game || null;
    // If this is true, any async stuff will terminate
    this.aborted = false;
    if(queue) {
      this.pushIn(queue);
    }
  }
  PreparedControls.prototype.useIfPossible = function(params, callback) {
    if(this.aborted)
      return false;
    if(typeof params=="object") {
      for(var i in params) {
        if(this.hasOwnProperty(i))
          this[i] = params[i];
      }
    }
    if(this.right!=null && this.left!=null && this.lineID!=null && this.game!=null && this.controls!=null) {
      this.controls.setLineControls(this.lineID, this.game, this.right, this.left);
      callback();
      this.remove();
    }
  }
  PreparedControls.prototype.pushIn = function(queue) {
    this.queue = queue;
    queue.push(this);
  }
  /*PreparedControls.prototype.timeout = function(timeout) {
    var _this = this;
    this.tID = setTimeout(function() {
      _this.tID = null;
      _this.removeFromQueue();
      console.warn("Key binding expired.");
    }, timeout);
  }    */
  PreparedControls.prototype.remove = function() {
    if(this.queue) {
      var index = this.queue.indexOf(this);
      if(index>=0)
        this.queue.splice(index, 1);
    }
    if(this.tID!=null) 
      clearTimeout(this.tID);
    if(this.selectorVisible) 
      $("#keySelector").fadeOut(100);
    this.aborted = true;
    this.tID = null;
    if(typeof this.onabort == "function") {
      this.onabort();
      this.onabort = null;
    }
  }
  PreparedControls.prototype.getKey = function(which, callback) {
    if(this.aborted) {
      callback();
      return;
    }
    $("#keySelector").fadeIn(100);
    this.selectorVisible = true;
    // Init the select element to default style
    $("#keySelector div.intro").removeClass("left right");
    $("#keySelector div.intro").addClass(which);
    $("#keySelector div.key").removeClass("taken");
    $("#keySelector div.key").addClass("none");
    $("#keySelector div.key").text("?");
    $("#keySelectorOk").prop('disabled', true);
    // Wait for the code
    var selCode = null;
    var _this = this;
    if(this.getTheKey!=null) {
      throw new Error("This class is already waiting for a key. Keys must be assigned one by one.");
    }
    this.controls.getNextControlUp(this.getTheKey = getTheKey, true);
    $("#keySelectorOk").one("click", keyCodeSelected); 
    this.onabort = function() {
      // Remove possible key press callback
      if(_this.getTheKey) {
        _this.controls.ungetNextControlUp(_this.getTheKey);
        _this.getTheKey = null;
      }
      //Also remove click listener
      $("#keySelectorOk").off("click", keyCodeSelected); 
      // Call callback so that async thread isn't stuck
      callback();
    }
    function getTheKey(code) {
      // It was once callback so we don't need to remember it any more
      _this.getTheKey = null;
      //calling callback with true causes async to abort
      if(_this.aborted) {
        callback();
        return;
      }
      // selCode is defined in upper scope!
      selCode = code;
      $("#keySelector div.key").removeClass("none taken");
      $("#keySelector div.key").text(window.KEYS?window.KEYS.KEY_CODES[code]:code);
      //check if key is already used
      if(_this.controls._events[selCode]!=null) {
        $("#keySelector div.key").addClass("taken");
        $("#keySelectorOk").prop('disabled', true);
      }
      else {
        $("#keySelectorOk").prop('disabled', false);
      }
      _this.controls.getNextControlUp(_this.getTheKey = getTheKey, true);
    }
    function keyCodeSelected() {
      // When the button gains focus it eats next keydown events
      // this only happens when it's disabled
      this.blur();
      _this[which] = selCode;
      _this.selectorVisible = false;
      //console.log("Key selected: "+window.KEYS.KEY_CODES[selCode]+" ["+selCode+"]");
      $("#keySelector").fadeOut(100);
      _this.onabort = null;
      if(_this.getTheKey) {
        _this.controls.ungetNextControlUp(_this.getTheKey);
        _this.getTheKey = null;
      }
      callback();
    }
    
  }
  
  function getControls() {
    var ctrl = new PreparedControls(game, controls);
    game.on("line.added", configureLineId);
    // If game declines the player info, we can abort
    // controls retrieval
    game.once("clientonly.msg.lineDeclined", abortGetControls);
    async.series([
          function(callback){ctrl.getKey("left", callback);},
          function(callback){ctrl.getKey("right", callback);},
          function(callback) {                    
              window.AddNewPayerButton();
              //console.log("Controls gathered.");
              ctrl.useIfPossible(null, success);   
              callback();
          } 
       ]
    );
    function configureLineId(id, name, color, local) {
      if(id!=-1 && local) {
        ctrl.useIfPossible({lineID: id});
        game.removeListener("line.added", configureLineId);
        game.removeListener("clientonly.msg.lineDeclined", abortGetControls);
        $("#playerName").val("Player "+game.lines.length);
      }
    }
    function abortGetControls() {
      //console.log("Aborting controls.");
      ctrl.remove();
      game.removeListener("line.added", configureLineId);
    } 
    function success() {
      if(!window.helpDisplayed)
        window.screenMessage("Press SPACE to start a game."); 
      window.helpDisplayed = true;
      resetPlayerForm();
    }
  }
});
requirejs(["keyCodes"], function(k) {window.KEYS=k;});
function RegisterBootboxDialogs(socket, game) { 
  var settings = {};
  function Settings(name, definition) {
    // Override any properties as needed
    if(typeof definition=="object") {
      for(var i in definition) {
        // Only include own properties, just to be sure
        if(definition.hasOwnProperty(i)) {
          // Special case - arrays can't be inherited so they're merged
          if(this[i] instanceof Array && definition[i] instanceof Array) {
            definition[i].push.apply(definition[i], this[i]);
            this[i] = definition[i];
          } else
            this[i]=definition[i];
        }
      }
    }
    //console.log(name, this);
    this.name = name;
    settings[name] = this;
  };
  Settings.prototype.makeChild = function() {
    function SettingsChild() {
      Settings.apply(this, arguments);
    }
    SettingsChild.prototype = Object.create(this);       
    //Push one entry to the beginning of the arguments
    // [SettingsChild, arg1, arg2, ...]
    // 1st entry will be consumed by build
    Array.prototype.unshift.call(arguments, SettingsChild);
    // Create sub instance
    return new (SettingsChild.bind.apply(SettingsChild, arguments));
  }
  new Settings("defaultMsg",
               {title: "Message",
                modal: true,
                autoOpen: true,
                buttons: [{
                      			text: "Ok",
                      			click: function() {$( this ).dialog("close");}
                      		}],
             		close: function(event) {
             		  var parent = this.parentNode;
             		  if(parent.extendedClassName.length>0) {
             		    console.log("Removing dialog class ",parent.extendedClassName,".");
             		    $(parent).removeClass(parent.extendedClassName);
             		    parent.extendedClassName = "";
             		  }
             		},
                id: "ui_dialog"}
  );
  settings.defaultMsg.makeChild(
                "errorMsg", 
               {className: ["error_dialog"],
                title: "Error!"});
  settings.errorMsg.makeChild(
                "lineDeclined", 
               {
                title: "Player couldn't be added!",
                buttons: [{
                      			text: "Try again",
                      			click: function() {
                                $( this ).dialog("close");
                                window.AddNewPayerButton(true);
                            }
                      		}],
               });  
                        
  window.ss = settings;
  //console.log(settings.lineDeclined.buttons);
  requirejs(["jquery-ui.min"], function() {
    game.on("clientonly.msg.*", function(message) {
      var evtName = this.event.substr("clientonly.msg.".length);
      var setting = /*Object.create*/(settings[evtName] || settings.defaultMsg); 
      $("#"+setting.id+" .text").html(message);
      $("#"+setting.id).dialog(setting);
      var dialog = $("#"+setting.id).parent();
      if(setting.className) {
        var cls = dialog[0].extendedClassName = setting.className.join(" ");
        dialog.addClass(cls);
        console.log("Adding dialog class ",cls,".");
      }
      else {
        dialog[0].extendedClassName = "";
      }
    });
  });
}

// Simulate some events
(function() {
  var lastToutchStart = 0;
  document.body.addEventListener("touchstart", function() {
    var t = performance.now();
    if(t-lastToutchStart<1000) {
      document.body.dispatchEvent(new Event("dblclick"));
    }
    lastToutchStart = t;
  });
})();
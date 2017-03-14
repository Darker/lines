define(function() {
    function CounterAnimation(element, speed, config) {
        this.speed = 1*speed>0?speed: 5;
        this.animating = false;
        // Desired value we're trying to reach
        this.newValue = 0;
        // Current/old value (should equal desired value when not animating)
        this.currentValue = 0;
        // Mid value during animation
        this.midValue = 0;
        // Used to time animations
        this.lastAnimation = 0;
        // Prevent losing this context on animate()
        this.animate = this.animate.bind(this);
        this.textChanged = this.textChanged.bind(this);
        this.ignoreChanges = true;
        if(config) {
          if(typeof config.formater=="function")
            this.formater = config.formater;
        }
        
        if(typeof element=="string")
            element = document.getElementById(element);
        if(element==null)
            throw new Error("Given null or invalid ID instead of element.");
        this.element = element;
        this.findFirstTextNode();
        this.currentValue = 1*this.textNode.data;
        this.textNode.data = this.formater(this.currentValue);
    }
    CounterAnimation.observerConfig = {attributes: false, childList: true, characterData: true};
    CounterAnimation.prototype.animate = function() {
        if(!this.animating)
            return false;
        var t = performance.now();
        var dt = t-this.lastAnimation;
        var direction = this.currentValue<this.newValue?1:-1;
        // Speed is in numbers per second, so we take miliseconds and
        // divide by 1000
        var step = (dt*direction*this.speed)/1000;
        // Skip insignificant steps
        if(Math.abs(step)>0.5) {
            this.midValue += step;
            // Detect if we reach the final value
            if((direction==1&&this.midValue>=this.newValue) ||
               (direction==-1&&this.midValue<=this.newValue)) {
                this.midValue = this.newValue;
                this.animating = false;
                //console.log("Animation finished!", direction, this.midValue, this.newValue, this.currentValue);
                this.currentValue = this.newValue;
            }
            // Save any changes to element from being lost here
            var records = this.observer.takeRecords();
            if(records.length>0) {
                setTimeout(function() {this.textChanged(records)}, 0);
                console.warn("Saved "+records.length+" records from being lost.");
            }
            this.textNode.data = this.formater(this.midValue);
            this.cssApplicator.call(this.element, this.currentValue, this.midValue, this.newValue, this.animating);
            this.lastAnimation = t;
            // Prevent changes to taking effect on this class
            this.observer.takeRecords();
        }
        requestAnimationFrame(this.animate);
    }
    CounterAnimation.prototype.formater = function(num) {
      return Math.round(num);
    }
    CounterAnimation.prototype.cssApplicator = function(num) {
      return;
    }
    CounterAnimation.prototype.findFirstTextNode = function() {
        var nodes = this.element.childNodes;
        //console.log("Finding text node element...");
        // Find suitable text node
        for(var i=0;i<nodes.length; i++) {
            if(nodes[i] instanceof Text) {
                return this.textNode = nodes[i];    
            }
        }
        //console.log("Not found, creating element.");
        var t = this.textNode = new Text("0");
        // It's FIRST so append it to the beginning
        if(this.element.firstChild) {
            this.element.insertBefore(t, this.element.firstChild);
        }
        else {
            this.element.appendChild(t);
        }
        return t;
    }
    CounterAnimation.prototype.observe = function(textNode) {
        var m = this.observer = new MutationObserver(function(mutations) {
          //console.log(mutations)
          mutations.forEach(this.textChanged);    
        }.bind(this));
        m.observe(this.element, CounterAnimation.observerConfig);
        this.currentValue = this.desiredValue = this.textNode.data*1;
    }
    CounterAnimation.prototype.destroy = function() {
        this.animating = false;
        this.observer.disconnect(this.element);
    }
    CounterAnimation.prototype.textChanged = function(mutation) {
        // Check if text node wasn't lost
        if(this.textNode.parentNode!=this.element) {
            //console.log("Text node no longer in dom. Finding new text node.");
            this.findFirstTextNode();
        }
        // Ignore child list changes that don't involve our textNode
        else if(mutation.type!="characterData") {
            //console.log(this.textNode.parentNode);
            return;
        }
        
        var newValue = this.textNode.data*1;
        if(newValue!=this.currentValue) {
          this.newValue = newValue;
          //console.log("Text changed!");
          if(!this.animating) {
              this.textNode.data = this.formater(this.currentValue);
              this.animating = true;
              this.lastAnimation = performance.now();
              this.midValue = this.currentValue;
              //console.log("Animating!");
              requestAnimationFrame(this.animate);
          }
          else {
              //console.log("Changing animation direction...");
              this.currentValue = this.midValue;
              this.textNode.data = this.formater(this.midValue); 
          }
        }
        // Format value even if it was the same
        else {
          this.textNode.data = this.formater(newValue);
        }
        // Prevent changes above from taking effect
        this.observer.takeRecords();
     
    }
    return CounterAnimation;
    /*
    var speed = 20;
    var c = new CounterAnimation("counter", speed);
    c.observe();
    //c.textNode.data = ""+(5*60);
    //setInterval(function() {console.log("Value: ",c.textNode.data = Math.round(Math.random()*200-100));}, 5000);
    setTimeout(function() {
        console.log("Value at 5:00 = ",c.textNode.data);
    }, 5*60*1000/speed);
    //console.log(c.observer.takeRecords());
    //$("#counter").html(""+(5*60)); */
});    
    

define(function() {
  function Pixels(width, height) {
    this.width = width;
    this.height = height;
    this.reset();
  }
  //Pixels.prototype = [];
  Pixels.prototype.reset = function() {
    //if(this.length==0) 
      //Create array large enough
      /*for(var i=0,l=this.height; i<l;i++) {
        this.push(undefined);
      } */
    this.array = new Uint8Array(this.width*this.height);
    /*else
      //Clear array
      for(var i=0,l=this.height; i<l;i++) {
        this[i] = undefined;
      }     */
    //Index mapping lines to their numbers
    this.lineMap = [];
    this.changed = true;
  }
  
  Pixels.prototype.pixelLine = function(x,y) {
    return this.lineByIndex(this.array[y*this.width+x]);
  }
  
  Pixels.prototype.pixelIsFree = function(x,y) {
    /*console.log("Checking pixel: [",x,", ", y,"].");
    var v = this[y]==undefined||this[y][x]==0;
    console.log("    - ",(v?"clear":"occupied")); */
    var i = x+y*this.width;
    return (this.array.length>i && i>=0 && this.array[i]==0);
    //(y>=0&&y<this.height && x>=0&&x<this.width) && (this[y]==undefined||this[y][x]==0);
  }
  
  Pixels.prototype.lineByIndex = function(i) {
    return i<=this.lineMap.length?this.lineMap[i-1]:null;
  }
  Pixels.prototype.indexByLine = function(line) {
    var index = this.lineMap.indexOf(line)+1;
    if(index>0)
      return index;
    this.lineMap.push(line);
    return this.lineMap.length;
  }
  
  Pixels.prototype.claimPixel = function(x,y, line, force) {
    var i = this.width*y+x;
    //if(!this.pixelFree(x,y))
    //  console.warn("Pixel "+[x,y]+" is already occupied.");
    if(i<0 || i>=this.array.length)
      throw new Error("Invalid pixel: "+[x,y]);
    if(x<0 || x>this.width || y<0 || y>this.height)
      throw new Error("Out of range!");
    var val = typeof line=="number"?line:this.indexByLine(line);
    if(typeof val != "number") {
      console.error("Line with no ID!");
    }
      
    if(this.array[i]!=0/* && this[y][x]!=val*/ && force!=true) {
      console.warn("Pixel "+[x,y]+" is already occupied.");
      throw new Error("Already occupied pixel ["+x+", "+y+"]!");
    }
    this.array[i] = val;
    this.changed = true;
    //console.log("Giving ",[x,y]," to ",line.name||val, " with index ",this.array[i]);
  }
  Pixels.prototype.freePixel = function(x,y) {
    this.array[this.width*y+x] = 0;
    this.changed = true;
  }

  /**
   * Claim multiple pixels given as array. If the claim fails, the exception
   * thrown will contain .lastPixel property indicating index of last claimed 
   * pixel. **/  
  Pixels.prototype.claimPixels = function(pixels, line, force) {
    //console.log("Line: ",line, " typeof ", typeof line);
    //line = this.indexByLine(line);
    for(var i=0,l=pixels.length-1; i<l; i+=2) {
      try {
        this.claimPixel(pixels[i], pixels[i+1], line, force);
      }
      catch(e) {
        e.lastPixel = i-1;
        throw e;
      }
    }
    //console.log("Pixels claimed for "+line.name);
  }
  /**
   * Test whether multiple pixels are free. */  
  Pixels.prototype.pixelsAreFree = function(pixels) {
    for(var i=0,l=pixels.length-1; i<l; i+=2) {
      if(!this.pixelIsFree(pixels[i], pixels[i+1])) {
        return false;
      }
    }
    return true;
  }
  Pixels.prototype.toString = function() {
    var str = ["\n"];
    /*for(var y=0,yl=this.array.length;y<yl; y++) {
      if(this[y]==undefined)
        str.push(" ".repeat(yl));
      else {
        str.push(this[y].join("").replace(/0/g," "));
      }
    }    */
    return str.join("\n");
  }
  Pixels.prototype.hasChanged = function() {
    var r = this.changed;
    this.changed=false;
    return r;
  }
  return Pixels;
});
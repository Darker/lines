//This is modified Victor library
define(function() {
  function VecFunctions(object) {
    /**
     * # Static
     */
    
    /**
     * Creates a new instance from an array
     *
     * ### Examples:
     *     var vec = object.fromArray([42, 21]);
     *
     *     vec.toString();
     *     // => x:42, y:21
     *
     * @name object.fromArray
     * @param {Array} array Array with the x and y values at index 0 and 1 respectively
     * @return {Victor} The new instance
     * @api public
     */
    object.fromArray = function (arr) {
    	return new Victor(arr[0] || 0, arr[1] || 0);
    };
    
    /**
     * Creates a new instance from an object
     *
     * ### Examples:
     *     var vec = object.fromObject({ x: 42, y: 21 });
     *
     *     vec.toString();
     *     // => x:42, y:21
     *
     * @name object.fromObject
     * @param {Object} obj Object with the values for x and y
     * @return {Victor} The new instance
     * @api public
     */
    object.fromObject = function (obj) {
    	return new object(obj.x || 0, obj.y || 0);
    };
    
    
    object.fromPoints = function(A, B) {
      return new object(B.x-A.x, B.y-A.y);
    }
    
    object.reduceAngle = function(angle) {
      // reduce the angle  
      angle =  angle % 360; 
      // force it to be the positive remainder, so that 0 <= angle < 360  
      angle = (angle + 360) % 360;  
      // force into the minimum absolute value residue class, so that -180 < angle <= 180  
      if (angle > 180)  
          angle -= 360;  
      return angle;
    }
    object.rotationAngle = function(alpha, beta) {
      alpha = object.reduceAngle(alpha);
      beta = object.reduceAngle(beta);
      // least of the calculations below is the correct turn angle
      var rotation_angle = [alpha-beta,
                                  alpha-beta+360,
                                  alpha-beta-360];
      var angle = rotation_angle[i];
      for(var i=0;i<3; i++) {
        if(Math.abs(rotation_angle[i])<Math.abs(angle)) {
          angle = rotation_angle[i];
        }
      }
      return angle;
    }
    object.rotationAngleAbs = function(alpha, beta) {
      return Math.abs(object.reduceAngle(alpha)-object.reduceAngle(beta));
    }
    
    /**
     * # Manipulation
     *
     * These functions are chainable.
     */
    
    /**
     * Adds another vector's X axis to this one
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *     var vec2 = new Victor(20, 30);
     *
     *     vec1.addX(vec2);
     *     vec1.toString();
     *     // => x:30, y:10
     *
     * @param {Victor} vector The other vector you want to add to this one
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.addX = function (vec) {
    	this.x += vec.x;
    	return this;
    };
    
    /**
     * Adds another vector's Y axis to this one
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *     var vec2 = new Victor(20, 30);
     *
     *     vec1.addY(vec2);
     *     vec1.toString();
     *     // => x:10, y:40
     *
     * @param {Victor} vector The other vector you want to add to this one
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.addY = function (vec) {
    	this.y += vec.y;
    	return this;
    };
    
    /**
     * Adds another vector to this one
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *     var vec2 = new Victor(20, 30);
     *
     *     vec1.add(vec2);
     *     vec1.toString();
     *     // => x:30, y:40
     *
     * @param {Victor} vector The other vector you want to add to this one
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.add = function (vec) {
    	this.x += vec.x;
    	this.y += vec.y;
    	return this;
    };
    
    /**
     * Adds the given scalar to both vector axis
     *
     * ### Examples:
     *     var vec = new Victor(1, 2);
     *
     *     vec.addScalar(2);
     *     vec.toString();
     *     // => x: 3, y: 4
     *
     * @param {Number} scalar The scalar to add
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.addScalar = function (scalar) {
    	this.x += scalar;
    	this.y += scalar;
    	return this;
    };
    
    /**
     * Adds the given scalar to the X axis
     *
     * ### Examples:
     *     var vec = new Victor(1, 2);
     *
     *     vec.addScalarX(2);
     *     vec.toString();
     *     // => x: 3, y: 2
     *
     * @param {Number} scalar The scalar to add
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.addScalarX = function (scalar) {
    	this.x += scalar;
    	return this;
    };
    
    /**
     * Adds the given scalar to the Y axis
     *
     * ### Examples:
     *     var vec = new Victor(1, 2);
     *
     *     vec.addScalarY(2);
     *     vec.toString();
     *     // => x: 1, y: 4
     *
     * @param {Number} scalar The scalar to add
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.addScalarY = function (scalar) {
    	this.y += scalar;
    	return this;
    };
    
    /**
     * Subtracts the X axis of another vector from this one
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(20, 30);
     *
     *     vec1.subtractX(vec2);
     *     vec1.toString();
     *     // => x:80, y:50
     *
     * @param {Victor} vector The other vector you want subtract from this one
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.subtractX = function (vec) {
    	this.x -= vec.x;
    	return this;
    };
    
    /**
     * Subtracts the Y axis of another vector from this one
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(20, 30);
     *
     *     vec1.subtractY(vec2);
     *     vec1.toString();
     *     // => x:100, y:20
     *
     * @param {Victor} vector The other vector you want subtract from this one
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.subtractY = function (vec) {
    	this.y -= vec.y;
    	return this;
    };
    
    /**
     * Subtracts another vector from this one
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(20, 30);
     *
     *     vec1.subtract(vec2);
     *     vec1.toString();
     *     // => x:80, y:20
     *
     * @param {Victor} vector The other vector you want subtract from this one
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.subtract = function (vec) {
    	this.x -= vec.x;
    	this.y -= vec.y;
    	return this;
    };
    
    /**
     * Subtracts the given scalar from both axis
     *
     * ### Examples:
     *     var vec = new Victor(100, 200);
     *
     *     vec.subtractScalar(20);
     *     vec.toString();
     *     // => x: 80, y: 180
     *
     * @param {Number} scalar The scalar to subtract
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.subtractScalar = function (scalar) {
    	this.x -= scalar;
    	this.y -= scalar;
    	return this;
    };
    
    /**
     * Subtracts the given scalar from the X axis
     *
     * ### Examples:
     *     var vec = new Victor(100, 200);
     *
     *     vec.subtractScalarX(20);
     *     vec.toString();
     *     // => x: 80, y: 200
     *
     * @param {Number} scalar The scalar to subtract
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.subtractScalarX = function (scalar) {
    	this.x -= scalar;
    	return this;
    };
    
    /**
     * Subtracts the given scalar from the Y axis
     *
     * ### Examples:
     *     var vec = new Victor(100, 200);
     *
     *     vec.subtractScalarY(20);
     *     vec.toString();
     *     // => x: 100, y: 180
     *
     * @param {Number} scalar The scalar to subtract
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.subtractScalarY = function (scalar) {
    	this.y -= scalar;
    	return this;
    };
    
    /**
     * Divides the X axis by the x component of given vector
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *     var vec2 = new Victor(2, 0);
     *
     *     vec.divideX(vec2);
     *     vec.toString();
     *     // => x:50, y:50
     *
     * @param {Victor} vector The other vector you want divide by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.divideX = function (vector) {
    	this.x /= vector.x;
    	return this;
    };
    
    /**
     * Divides the Y axis by the y component of given vector
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *     var vec2 = new Victor(0, 2);
     *
     *     vec.divideY(vec2);
     *     vec.toString();
     *     // => x:100, y:25
     *
     * @param {Victor} vector The other vector you want divide by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.divideY = function (vector) {
    	this.y /= vector.y;
    	return this;
    };
    
    /**
     * Divides both vector axis by a axis values of given vector
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *     var vec2 = new Victor(2, 2);
     *
     *     vec.divide(vec2);
     *     vec.toString();
     *     // => x:50, y:25
     *
     * @param {Victor} vector The vector to divide by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.divide = function (vector) {
    	this.x /= vector.x;
    	this.y /= vector.y;
    	return this;
    };
    
    /**
     * Divides both vector axis by the given scalar value
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.divideScalar(2);
     *     vec.toString();
     *     // => x:50, y:25
     *
     * @param {Number} The scalar to divide by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.divideScalar = function (scalar) {
    	if (scalar !== 0) {
    		this.x /= scalar;
    		this.y /= scalar;
    	} else {
    		this.x = 0;
    		this.y = 0;
    	}
    
    	return this;
    };
    
    /**
     * Divides the X axis by the given scalar value
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.divideScalarX(2);
     *     vec.toString();
     *     // => x:50, y:50
     *
     * @param {Number} The scalar to divide by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.divideScalarX = function (scalar) {
    	if (scalar !== 0) {
    		this.x /= scalar;
    	} else {
    		this.x = 0;
    	}
    	return this;
    };
    
    /**
     * Divides the Y axis by the given scalar value
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.divideScalarY(2);
     *     vec.toString();
     *     // => x:100, y:25
     *
     * @param {Number} The scalar to divide by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.divideScalarY = function (scalar) {
    	if (scalar !== 0) {
    		this.y /= scalar;
    	} else {
    		this.y = 0;
    	}
    	return this;
    };
    
    /**
     * Inverts the X axis
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.invertX();
     *     vec.toString();
     *     // => x:-100, y:50
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.invertX = function () {
    	this.x *= -1;
    	return this;
    };
    
    /**
     * Inverts the Y axis
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.invertY();
     *     vec.toString();
     *     // => x:100, y:-50
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.invertY = function () {
    	this.y *= -1;
    	return this;
    };
    
    /**
     * Inverts both axis
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.invert();
     *     vec.toString();
     *     // => x:-100, y:-50
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.invert = function () {
    	this.invertX();
    	this.invertY();
    	return this;
    };
    
    /**
     * Multiplies the X axis by X component of given vector
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *     var vec2 = new Victor(2, 0);
     *
     *     vec.multiplyX(vec2);
     *     vec.toString();
     *     // => x:200, y:50
     *
     * @param {Victor} vector The vector to multiply the axis with
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.multiplyX = function (vector) {
    	this.x *= vector.x;
    	return this;
    };
    
    /**
     * Multiplies the Y axis by Y component of given vector
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *     var vec2 = new Victor(0, 2);
     *
     *     vec.multiplyX(vec2);
     *     vec.toString();
     *     // => x:100, y:100
     *
     * @param {Victor} vector The vector to multiply the axis with
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.multiplyY = function (vector) {
    	this.y *= vector.y;
    	return this;
    };
    
    /**
     * Multiplies both vector axis by values from a given vector
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *     var vec2 = new Victor(2, 2);
     *
     *     vec.multiply(vec2);
     *     vec.toString();
     *     // => x:200, y:100
     *
     * @param {Victor} vector The vector to multiply by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.multiply = function (vector) {
      if(typeof vector=="number") {
      	this.x *= vector;
      	this.y *= vector;
      }
      else {
      	this.x *= vector.x;
      	this.y *= vector.y;
    	}
    	return this;
    };
    
    /**
     * Multiplies both vector axis by the given scalar value
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.multiplyScalar(2);
     *     vec.toString();
     *     // => x:200, y:100
     *
     * @param {Number} The scalar to multiply by
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.multiplyScalar = function (scalar) {
    	this.x *= scalar;
    	this.y *= scalar;
    	return this;
    };
    
    /**
     * Multiplies the X axis by the given scalar
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.multiplyScalarX(2);
     *     vec.toString();
     *     // => x:200, y:50
     *
     * @param {Number} The scalar to multiply the axis with
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.multiplyScalarX = function (scalar) {
    	this.x *= scalar;
    	return this;
    };
    
    /**
     * Multiplies the Y axis by the given scalar
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.multiplyScalarY(2);
     *     vec.toString();
     *     // => x:100, y:100
     *
     * @param {Number} The scalar to multiply the axis with
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.multiplyScalarY = function (scalar) {
    	this.y *= scalar;
    	return this;
    };
    
    /**
     * Normalize
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.normalize = function () {
    	var length = this.size;
    
    	if (length === 0) {
    		this[0] = 1;
    		this.y = 0;
    	} else {
    		this.divide(Victor(length, length));
    	}
    	return this;
    };
    
    object.prototype.norm = object.prototype.normalize;
    
    /**
     * If the absolute vector axis is greater than `max`, multiplies the axis by `factor`
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.limit(80, 0.9);
     *     vec.toString();
     *     // => x:90, y:50
     *
     * @param {Number} max The maximum value for both x and y axis
     * @param {Number} factor Factor by which the axis are to be multiplied with
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.limit = function (max, factor) {
    	if (Math.abs(this[0]) > max){ this.x *= factor; }
    	if (Math.abs(this.y) > max){ this.y *= factor; }
    	return this;
    };
    
    /**
     * Randomizes both vector axis with a value between 2 vectors
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.randomize(new Victor(50, 60), new Victor(70, 80`));
     *     vec.toString();
     *     // => x:67, y:73
     *
     * @param {Victor} topLeft first vector
     * @param {Victor} bottomRight second vector
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.randomize = function (topLeft, bottomRight) {
    	this.randomizeX(topLeft, bottomRight);
    	this.randomizeY(topLeft, bottomRight);
    
    	return this;
    };
    
    /**
     * Randomizes the y axis with a value between 2 vectors
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.randomizeX(new Victor(50, 60), new Victor(70, 80`));
     *     vec.toString();
     *     // => x:55, y:50
     *
     * @param {Victor} topLeft first vector
     * @param {Victor} bottomRight second vector
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.randomizeX = function (topLeft, bottomRight) {
    	var min = Math.min(topLeft.x, bottomRight.x);
    	var max = Math.max(topLeft.x, bottomRight.x);
    	this.x = random(min, max);
    	return this;
    };
    
    /**
     * Randomizes the y axis with a value between 2 vectors
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.randomizeY(new Victor(50, 60), new Victor(70, 80`));
     *     vec.toString();
     *     // => x:100, y:66
     *
     * @param {Victor} topLeft first vector
     * @param {Victor} bottomRight second vector
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.randomizeY = function (topLeft, bottomRight) {
    	var min = Math.min(topLeft.y, bottomRight.y);
    	var max = Math.max(topLeft.y, bottomRight.y);
    	this.y = random(min, max);
    	return this;
    };
    
    /**
     * Randomly randomizes either axis between 2 vectors
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.randomizeAny(new Victor(50, 60), new Victor(70, 80));
     *     vec.toString();
     *     // => x:100, y:77
     *
     * @param {Victor} topLeft first vector
     * @param {Victor} bottomRight second vector
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.randomizeAny = function (topLeft, bottomRight) {
    	if (!! Math.round(Math.random())) {
    		this.randomizeX(topLeft, bottomRight);
    	} else {
    		this.randomizeY(topLeft, bottomRight);
    	}
    	return this;
    };
    
    /**
     * Rounds both axis to an integer value
     *
     * ### Examples:
     *     var vec = new Victor(100.2, 50.9);
     *
     *     vec.unfloat();
     *     vec.toString();
     *     // => x:100, y:51
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.round = function () {
    	this.x = Math.round(this[0]);
    	this.y = Math.round(this[1]);
    	return this;
    };
    
    /**
     * Rounds both axis to a certain precision
     *
     * ### Examples:
     *     var vec = new Victor(100.2, 50.9);
     *
     *     vec.unfloat();
     *     vec.toString();
     *     // => x:100, y:51
     *
     * @param {Number} Precision (default: 8)
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.toFixed = function (precision) {
    	if (typeof precision === 'undefined') { precision = 8; }
    	this.x = this[0].toFixed(precision);
    	this.y = this[1].toFixed(precision);
    	return this;
    };
    
    /**
     * Performs a linear blend / interpolation of the X axis towards another vector
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 100);
     *     var vec2 = new Victor(200, 200);
     *
     *     vec1.mixX(vec2, 0.5);
     *     vec.toString();
     *     // => x:150, y:100
     *
     * @param {Victor} vector The other vector
     * @param {Number} amount The blend amount (optional, default: 0.5)
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.mixX = function (vec, amount) {
    	if (typeof amount === 'undefined') {
    		amount = 0.5;
    	}
    
    	this.x = (1 - amount) * this[0] + amount * vec.x;
    	return this;
    };
    
    /**
     * Performs a linear blend / interpolation of the Y axis towards another vector
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 100);
     *     var vec2 = new Victor(200, 200);
     *
     *     vec1.mixY(vec2, 0.5);
     *     vec.toString();
     *     // => x:100, y:150
     *
     * @param {Victor} vector The other vector
     * @param {Number} amount The blend amount (optional, default: 0.5)
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.mixY = function (vec, amount) {
    	if (typeof amount === 'undefined') {
    		amount = 0.5;
    	}
    
    	this.y = (1 - amount) * this.y + amount * vec.y;
    	return this;
    };
    
    /**
     * Performs a linear blend / interpolation towards another vector
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 100);
     *     var vec2 = new Victor(200, 200);
     *
     *     vec1.mix(vec2, 0.5);
     *     vec.toString();
     *     // => x:150, y:150
     *
     * @param {Victor} vector The other vector
     * @param {Number} amount The blend amount (optional, default: 0.5)
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.mix = function (vec, amount) {
    	this.mixX(vec, amount);
    	this.mixY(vec, amount);
    	return this;
    };
    
    /**
     * # Products
     */
    
    /**
     * Creates a clone of this vector
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *     var vec2 = vec1.clone();
     *
     *     vec2.toString();
     *     // => x:10, y:10
     *
     * @return {Victor} A clone of the vector
     * @api public
     */
    object.prototype.clone = function () {
    	return new object(this[0], this[1]);
    };
    
    
    object.prototype.cloneMoved = function (vec) {
    	return new object(this[0]+vec[0], this[1]+vec[1]);
    };
    object.prototype.cloneSubtract = function (vec) {
    	return new object(this[0]-vec[0], this[1]-vec[1]);
    };
    /**
     * Copies another vector's X component in to its own
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *     var vec2 = new Victor(20, 20);
     *     var vec2 = vec1.copyX(vec1);
     *
     *     vec2.toString();
     *     // => x:20, y:10
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.copyX = function (vec) {
    	this.x = vec[0];
    	return this;
    };
    
    /**
     * Copies another vector's Y component in to its own
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *     var vec2 = new Victor(20, 20);
     *     var vec2 = vec1.copyY(vec1);
     *
     *     vec2.toString();
     *     // => x:10, y:20
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.copyY = function (vec) {
    	this.y = vec[1];
    	return this;
    };
    
    /**
     * Copies another vector's X and Y components in to its own
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *     var vec2 = new Victor(20, 20);
     *     var vec2 = vec1.copy(vec1);
     *
     *     vec2.toString();
     *     // => x:20, y:20
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.copy = function (vec) {
    	this.copyX(vec);
    	this.copyY(vec);
    	return this;
    };
    
    /**
     * Sets the vector to zero (0,0)
     *
     * ### Examples:
     *     var vec1 = new Victor(10, 10);
     *		 var1.zero();
     *     vec1.toString();
     *     // => x:0, y:0
     *
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.zero = function () {
    	this[0] = this.y = 0;
    	return this;
    };
    
    /**
     * Calculates the dot product of this vector and another
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(200, 60);
     *
     *     vec1.dot(vec2);
     *     // => 23000
     *
     * @param {Victor} vector The second vector
     * @return {Number} Dot product
     * @api public
     */
    object.prototype.dot = function (vec2) {
    	return this.x * vec2.x + this.y * vec2.y;
    };
    
    object.prototype.cross = function (vec2) {
    	return (this.x * vec2.y ) - (this.y * vec2.x );
    };
    
    /**
     * Projects a vector onto another vector, setting itself to the result.
     *
     * ### Examples:
     *     var vec = new Victor(100, 0);
     *     var vec2 = new Victor(100, 100);
     *
     *     vec.projectOnto(vec2);
     *     vec.toString();
     *     // => x:50, y:50
     *
     * @param {Victor} vector The other vector you want to project this vector onto
     * @return {Victor} `this` for chaining capabilities
     * @api public
     */
    object.prototype.projectOnto = function (vec2) {
        var coeff = ( (this[0] * vec2.x)+(this.y * vec2.y) ) / ((vec2.x*vec2.x)+(vec2.y*vec2.y));
        this.x = coeff * vec2.x;
        this.y = coeff * vec2.y;
        return this;
    };
    
    
    object.prototype.horizontalAngle = function () {
    	return Math.atan2(this[1], this[0]);
    };
    
    object.prototype.horizontalAngleDeg = function () {
    	return radian2degrees(this.horizontalAngle());
    };
    
    object.prototype.verticalAngle = function () {
    	return Math.atan2(this[0], this.y);
    };
    
    object.prototype.verticalAngleDeg = function () {
    	return radian2degrees(this.verticalAngle());
    };
    
    object.prototype.angle = object.prototype.horizontalAngle;
    object.prototype.angleDeg = object.prototype.horizontalAngleDeg;
    object.prototype.direction = object.prototype.horizontalAngle;
    
    object.prototype.rotate = function (angle) {
    	var nx = (this[0] * Math.cos(angle)) - (this[1] * Math.sin(angle));
    	var ny = (this[0] * Math.sin(angle)) + (this[1] * Math.cos(angle));
    
    	this[0] = nx;
    	this[1] = ny;
    
    	return this;
    };
    
    object.prototype.rotateDeg = function (angle) {
    	angle = degrees2radian(angle);
    	return this.rotate(angle);
    };
    
    object.prototype.rotateTo = function(rotation) {
    	return this.rotate(rotation-this.angle());
    };
    
    object.prototype.rotateToDeg = function(rotation) {
    	rotation = degrees2radian(rotation);
    	return this.rotateTo(rotation);
    };
    
    object.prototype.rotateBy = function (rotation) {
    	var angle = this.angle() + rotation;
    
    	return this.rotate(angle);
    };
    
    object.prototype.rotateByDeg = function (rotation) {
    	rotation = degrees2radian(rotation);
    	return this.rotateBy(rotation);
    };
    
    object.prototype.moveByAngle = function (angle, distance) {
      //console.log(this+"Moving by "+angle+" radians over "+distance+" units.");
    	this.x+= distance*Math.cos(angle);
    	this.y+= distance*Math.sin(angle);
    	//console.log(this+"Done.");
    	return this;
    };
    /**
     * Calculates the distance of the X axis between this vector and another
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(200, 60);
     *
     *     vec1.distanceX(vec2);
     *     // => -100
     *
     * @param {Victor} vector The second vector
     * @return {Number} Distance
     * @api public
     */
    object.prototype.distanceX = function (vec) {
    	return this[0] - vec.x;
    };
    
    /**
     * Same as `distanceX()` but always returns an absolute number
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(200, 60);
     *
     *     vec1.absDistanceX(vec2);
     *     // => 100
     *
     * @param {Victor} vector The second vector
     * @return {Number} Absolute distance
     * @api public
     */
    object.prototype.absDistanceX = function (vec) {
    	return Math.abs(this.distanceX(vec));
    };
    
    /**
     * Calculates the distance of the Y axis between this vector and another
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(200, 60);
     *
     *     vec1.distanceY(vec2);
     *     // => -10
     *
     * @param {Victor} vector The second vector
     * @return {Number} Distance
     * @api public
     */
    object.prototype.distanceY = function (vec) {
    	return this.y - vec.y;
    };
    
    /**
     * Same as `distanceY()` but always returns an absolute number
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(200, 60);
     *
     *     vec1.distanceY(vec2);
     *     // => 10
     *
     * @param {Victor} vector The second vector
     * @return {Number} Absolute distance
     * @api public
     */
    object.prototype.absDistanceY = function (vec) {
    	return Math.abs(this.distanceY(vec));
    };
    
    /**
     * Calculates the euclidean distance between this vector and another
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(200, 60);
     *
     *     vec1.distance(vec2);
     *     // => 100.4987562112089
     *
     * @param {Victor} vector The second vector
     * @return {Number} Distance
     * @api public
     */
    object.prototype.distance = function (vec) {
    	return Math.sqrt(this.distanceSq(vec));
    };
    
    /**
     * Calculates the squared euclidean distance between this vector and another
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(200, 60);
     *
     *     vec1.distanceSq(vec2);
     *     // => 10100
     *
     * @param {Victor} vector The second vector
     * @return {Number} Distance
     * @api public
     */
    object.prototype.distanceSq = function (vec) {
    	var dx = this.distanceX(vec),
    		dy = this.distanceY(vec);
    
    	return dx * dx + dy * dy;
    };
    
    /**
     * Calculates the length or magnitude of the vector
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.calcLength;
     *     // => 111.80339887498948
     *
     * @return {Number} Length / Magnitude
     * @api public
     */
    object.prototype.calcSize = function () {
    	return Math.sqrt(this.lengthSq());
    };
    
    Object.defineProperty(object.prototype, "size", {
      get: object.prototype.calcSize,
      enumerable: true
    });  
    /**
     * Squared length / magnitude
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *
     *     vec.lengthSq();
     *     // => 12500
     *
     * @return {Number} Length / Magnitude
     * @api public
     */
    object.prototype.lengthSq = function () {
    	return this[0] * this[0] + this[1] * this[1];
    };
    
    object.prototype.magnitude = object.prototype.size;
    
    /**
     * Returns a true if vector is (0, 0)
     *
     * ### Examples:
     *     var vec = new Victor(100, 50);
     *     vec.zero();
     *
     *     // => true
     *
     * @return {Boolean}
     * @api public
     */
    object.prototype.isZero = function() {
    	return this[0] === 0 && this.y === 0;
    };
    
    /**
     * Returns a true if this vector is the same as another
     *
     * ### Examples:
     *     var vec1 = new Victor(100, 50);
     *     var vec2 = new Victor(100, 50);
     *     vec1.isEqualTo(vec2);
     *
     *     // => true
     *
     * @return {Boolean}
     * @api public
     */
    object.prototype.isEqualTo = function(vec2) {
    	return this[0] === vec2.x && this.y === vec2.y;
    };
    
    /**
     * # Utility Methods
     */
    
    /**
     * Returns an string representation of the vector
     *
     * ### Examples:
     *     var vec = new Victor(10, 20);
     *
     *     vec.toString();
     *     // => x:10, y:20
     *
     * @return {String}
     * @api public
     */
    object.prototype.toString = function () {
    	return '[' + this[0] + ', ' + this[1]+']';
    };
    
    /**
     * Returns an array representation of the vector
     *
     * ### Examples:
     *     var vec = new Victor(10, 20);
     *
     *     vec.toArray();
     *     // => [10, 20]
     *
     * @return {Array}
     * @api public
     */
    object.prototype.toArray = function () {
    	return [ this[0], this[1] ];
    };
    
    /**
     * Returns an object representation of the vector
     *
     * ### Examples:
     *     var vec = new Victor(10, 20);
     *
     *     vec.toObject();
     *     // => { x: 10, y: 20 }
     *
     * @return {Object}
     * @api public
     */
    object.prototype.toObject = function () {
    	return { x: this[0], y: this.y };
    };
    
    
    var degrees = 180 / Math.PI;
    
    function random (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    function radian2degrees (rad) {
    	return rad * degrees;
    }
    
    function degrees2radian (deg) {
    	return deg / degrees;
    }
    
    /*},{}]},{},[1])
    (1)
    });   */
  }
  return VecFunctions;
});
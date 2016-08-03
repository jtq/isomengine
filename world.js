function World(width, depth) {
	this.width = width;
	this.depth = depth;
	this.objects = {};
	this.world = {};
	
	this.outofBounds = function(x, z) {
		if(x instanceof Object) {
			z = x.z;
			x = x.x;
		}
		return (x<0 || x>=this.width || z<0 || z>=this.depth);
	};

	this.inBounds = function(x, z) {
		return !this.outOfBounds(x, z);
	};

	this.validObject = function(obj) {
		return !!(obj instanceof Object && obj.id);	// Object with an id
	};

	this.objectExists = function(obj) {
		return this.validObject(obj) && this.objects[obj.id];
	};

	this.validNewObject = function(obj) {
		return this.validObject(obj) && !this.objects[obj.id];	// Object with an id
	};

	this.add = function(obj, x, z) {

		obj.id = obj.id || Math.floor(Math.random()*Number.MAX_SAFE_INTEGER);

		if(this.outofBounds(x,z) || !this.validNewObject(obj)) {
			return false;
		}
		x = x || obj.x;
		z = z || obj.z;
		this.world[x+","+z] = obj;
		this.objects[obj.id] = obj;
		return true;
	};

	this.remove = function(obj) {
		if(!this.objectExists(obj)) {
			return false;
		}
		delete this.world[obj.x+","+obj.z];
		obj.x = null;
		obj.z = null;
		delete(this.objects[obj.id]);
		return true;
	};

	this.getAt = function(x, z) {
		if(this.outofBounds(x,z)) {
			return undefined;
		}
		return this.world[x+","+z] || null;
	};

	this.passable = function(x, z, ignoreableTypes) {
		if(x instanceof Object) {
			ignoreableTypes = z;
			z = x.z;
			x = x.x;
		}
		if(!ignoreableTypes) { ignoreableTypes = []; }
		if(!(ignoreableTypes instanceof Array)) { ignoreableTypes = [ignoreableTypes]; }	// Coerce ignorableTypes to an array

		var obj = this.getAt(x, z);

		if(typeof obj === "undefined") {	// Out of bounds
			return false;
		}
		else if(obj === null) {	// Empty space
			return true;
		}
		return ignoreableTypes.some(function(ignorableType) {	// Is the object any ignorable type?
			return obj.type === ignorableType;
		});
	};

	this.getBy = function(attrib, value) {
		var self = this;
		return Object.keys(this.objects)
			.map(function(id) {
				return self.objects[id];
			})
			.filter(function(obj) {
				return obj[attrib] === value;
			});
	};

	this.moveTo = function(obj, x, z) {
		if(this.outofBounds(x,z) || !this.objectExists(obj)) {
			return false;
		}
		delete(this.world[obj.x+","+obj.z]);	// Unset old position
		obj.x = x;
		obj.z = z;
		this.world[x+","+z] = obj;
		return true;
	};

	this.manhattanDistance = function(obj1, obj2) {
		return Math.abs(obj1.x - obj2.x) + Math.abs(obj1.z - obj2.z);
	}

	this.step = function() {
		var objects = Object.keys(this.objects).map(function(id) { return this.objects[id]; }.bind(this));
		var nextStep;
		objects.forEach(function(obj) {
			if(obj.route.length) {
				nextStep = obj.route.shift();
				this.moveTo(obj, nextStep.x, nextStep.z);
			}
		}.bind(this));
	};
}


module.exports = World;
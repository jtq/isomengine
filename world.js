function World(width, depth) {
	this.width = width;
	this.depth = depth;
	this.objects = {};
	this.world = [];
	for(let x = 0; x < width; x++) {
		this.world[x] = [];
	}

	this.outofBounds = function(x, z) {
		return (x<0 || x>=this.width || z<0 || z>=this.depth);
	};

	this.validObject = function(obj) {
		return !!(obj instanceof Object && obj.id);	// Object with an id
	};

	this.objectExists = function(obj) {
		return this.validObject(obj) && this.objects[obj.id];
	}

	this.validNewObject = function(obj) {
		return this.validObject(obj) && !this.objects[obj.id];	// Object with an id
	};

	this.add = function(obj, x, z) {
		if(this.outofBounds(x,z) || !this.validNewObject(obj)) {
			return false;
		}
		x = x || obj.x;
		z = z || obj.z;
		this.world[x][z] = obj;
		this.objects[obj.id] = obj;
		return true;
	};

	this.remove = function(obj) {
		if(!this.objectExists(obj)) {
			return false;
		}
		this.world[obj.x][obj.z] = undefined;
		obj.x = null;
		obj.z = null;
		delete(this.objects[obj.id]);
		return true;
	};

	this.getAt = function(x, z) {
		if(this.outofBounds(x,z)) {
			return undefined;
		}
		return this.world[x][z] || null;
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
		delete(this.world[obj.x][obj.z]);	// Unset old position
		obj.x = x;
		obj.z = z;
		this.world[x][z] = obj;
		return true;
	};

	this.step = function() {

	};
}


module.exports = World;
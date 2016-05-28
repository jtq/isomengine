function World(width, depth) {
	this.width = width;
	this.depth = depth;
	this.objects = {};
	this.world = [];
	for(let x = 0; x < width; x++) {
		this.world[x] = [];
	}

	this.add = function(obj, x, z) {
		if(!(obj instanceof Object) || !obj.id) {
			console.error("Objects must have an id", obj);
		}
		x = x || obj.x;
		z = z || obj.z;
		this.world[x][z] = obj;
		this.objects[obj.id] = obj;
	};

	this.getAt = function(x, z) {
		return this.world[x][z];
	};

	this.moveTo = function(obj, x, z) {
		this.world[obj.x][obj.z] = undefined;	// Unset old position
		obj.x = x;
		obj.z = z;
		this.world[x][z] = obj;
	};

	this.step = function() {

	};
}


module.exports = World;
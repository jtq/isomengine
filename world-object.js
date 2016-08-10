function WorldObject(type, x, z, eventHandlers, id) {
	this.type = type;
	this.id = id || Math.floor(Math.random()*Number.MAX_SAFE_INTEGER);
	this.x = x;
	this.z = z;
	this.interactable = !!eventHandlers;
	this.eventHandlers = eventHandlers;
	this.route = [];

	this.roles = {};
}

WorldObject.prototype.is = function(role) {
	return !!this.roles[role];
}
WorldObject.prototype.set = function(roles) {
	if(!(roles instanceof Array)) {
		roles = [roles];
	}

	roles.forEach(function(role) {
		this.roles[role] = true;
	}.bind(this));
}


module.exports = WorldObject;
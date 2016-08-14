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

WorldObject.prototype.setRendererObject = function(obj) {
	this.rendererObject = obj;
};

WorldObject.prototype.is = function(role) {
	return !!this.roles[role];
};

WorldObject.prototype.set = function(roles) {
	if(!(roles instanceof Array)) {
		roles = [roles];
	}

	roles.forEach(function(role) {
		this.roles[role] = true;
	}.bind(this));
};

WorldObject.prototype.not = function(roles) {
	if(!(roles instanceof Array)) {
		roles = [roles];
	}

	roles.forEach(function(role) {
		delete(this.roles[role]);
	}.bind(this));
};

WorldObject.prototype.getRoles = function() {
	var roleNames = Object.keys(this.roles).filter(function(role) {
		return !!this.roles[role];
	}.bind(this)).sort();
	return roleNames;
};


WorldObject.prototype.setRoute = function(route) {
	this.route = route;
};

module.exports = WorldObject;
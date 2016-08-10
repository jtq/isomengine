var WorldObject = require('./world-object');

function Chest(x, z, eventHandlers, id) {
	var args = Array.prototype.slice.call(arguments);
	args.unshift("chest");
	WorldObject.apply(this, args);

	this.set("interactable");
};

Chest.prototype = Object.create(WorldObject.prototype);
Chest.prototype.constructor = Chest;


module.exports = Chest;
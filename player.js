var WorldObject = require('./world-object');

function Player(x, z, eventHandlers, id) {
	var args = Array.prototype.slice.call(arguments);
	args.unshift("player");
	WorldObject.apply(this, args);
};

Player.prototype = Object.create(WorldObject.prototype);
Player.prototype.constructor = Player;

Player.prototype.step = function(world) {
	if(this.route.length) {
		this.set('moving');
		nextStep = this.route.shift();
		world.moveTo(this, nextStep.x, nextStep.z);
	}
	else {
		this.not('moving');
	}
};


module.exports = Player;
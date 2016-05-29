var tween = require('@jtq/tween');

function Pathfinder(world) {
	this.world = world;
}

Pathfinder.prototype.find = function(from, to) {

	if(from instanceof Array) { from = { x: from[0], y: from[1] } }	// Coerce to object
	if(to instanceof Array) { to = { x: to[0], y: to[1] } }

	var numSteps = Math.max(Math.abs(to.x-from.x), Math.abs(to.y-from.y));	// Choose dx or dy steps - whichever is greater
	var steps = [];

	var step;
	for(var i=0; i<numSteps; i++) {
		step = tween.stateAt(from, to, numSteps, i, null, null);
		step.x = Math.round(step.x);
		step.y = Math.round(step.y);
		steps.push(step);
	}

	return steps;
};

module.exports = Pathfinder;
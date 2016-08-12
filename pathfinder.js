var tween = require('@jtq/tween');

function Pathfinder(world, adjacency_rule) {
	this.world = world;
	this.adjacency_rule = adjacency_rule || this.DIAGONALS_ALLOWED;
}

Pathfinder.prototype.DIAGONALS_ALLOWED = 1;
Pathfinder.prototype.COMPASS_DIRECTIONS = 2;

Pathfinder.prototype.findDirect = function(from, to) {

	if(from instanceof Array) { from = { x: from[0], z: from[1] } }	// Coerce to object
	if(to instanceof Array) { to = { x: to[0], z: to[1] } }

	var numSteps = Math.max(Math.abs(to.x-from.x), Math.abs(to.z-from.z));	// Choose dx or dy steps - whichever is greater
	var steps = [];

	var step;
	for(var i=0; i<numSteps; i++) {
		step = tween.stateAt(from, to, numSteps, i, null, null);
		step.x = Math.round(step.x);
		step.z = Math.round(step.z);
		steps.push(step);
	}

	return steps;
};

Pathfinder.prototype.findClear = function(from, to, ignoreableTypes) {

	if(from instanceof Array) { from = { x: from[0], z: from[1] } }	// Coerce to object
	if(to instanceof Array) { to = { x: to[0], z: to[1] } }

	if(!ignoreableTypes) { ignoreableTypes = []; }
	if(!(ignoreableTypes instanceof Array)) { ignoreableTypes = [ignoreableTypes]; }	// Coerce ignorableTypes to an array

	var self = this;

	var steps = [{ x:to.x, z:to.z, d:0 }];

	for(let i=0; i<steps.length; i++) {
		var current = steps[i];
		var adjacent = this.getAdjacents(current).filter(function(square) {
			return self.world.passable(square, ignoreableTypes) || self.world.manhattanDistance(square, to) === 0;
		});
		adjacent.forEach(function(square) {
			square.d = current.d + 1;
		});

		for(let a=0; a<adjacent.length; a++) {
			var adj = adjacent[a];
			for(let s=0; s<steps.length; s++) {
				var step = steps[s];
				if(adj.x === step.x && adj.z === step.z) {
					if(step.d <= adj.d) {
						adjacent.splice(a, 1);
						a--;
					}
					else {
						steps.splice(s, 1);
						s--;
					}
				}
			}	
		}

		steps = steps.concat(adjacent);
		if(adjacent.some(function(adj) { return adj.x === from.x && adj.z === from.z; })) {
			break;
		}
	}

	var board = [];	// Create empty board the size of the world
	for(let x = 0; x < this.world.width; x++) {
		board[x] = [];
	}
	steps.forEach(function(step) {
		board[step.x][step.z] = step.d;
	});
	
	// Ran out of next steps before we connected destination to source (in other words, destination unreachable from source)
	if(!board[from.x][from.z]) {
		return null;
	}

	var loop = from;
	var route = [from];
	while(loop && (loop.x !== to.x || loop.z !== to.z)) {
		var weight = board[loop.x][loop.z];
		var passableAdjacents = this.getRandomisedAdjacents(loop).filter(function(square) {
			return self.world.passable(square, ignoreableTypes);
		});

		loop = passableAdjacents.find(function(adj) {
			return board[adj.x][adj.z] === weight - 1;
		});
		route.push(loop);
	}

	if(!self.world.passable(to, ignoreableTypes)) {
		route.pop();
	}

	return route;
};

Pathfinder.prototype.getAdjacents = function(x, z) {
	if(x instanceof Object) {
		z = x.z;
		x = x.x;
	}
	if(this.adjacency_rule === this.DIAGONALS_ALLOWED) {
		return [
			{ x:x-1, z:z-1 },	{ x:x, z:z-1 },	{ x:x+1, z:z-1 },
			{ x:x-1, z:z },						{ x:x+1, z:z },
			{ x:x-1, z:z+1 },	{ x:x, z:z+1 },	{ x:x+1, z:z+1 }
		];
	}
	else {
		return [
							{ x:x, z:z-1 },
			{ x:x-1, z:z },					{ x:x+1, z:z },
							{ x:x, z:z+1 }
		];
	}
};

Pathfinder.prototype.getRandomisedAdjacents = function(x, z) {
	
	function shuffleArray(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	return shuffleArray(this.getAdjacents(x, z));
}

module.exports = Pathfinder;
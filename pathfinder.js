var tween = require('@jtq/tween');
var World = require('./world.js');

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

	var board = new World(this.world.width, this.world.depth);


	var firstItem = { x:to.x, z:to.z, d:0 };
	var steps = [firstItem];
	board.add(firstItem, firstItem.x, firstItem.z);

	while(steps.length > 0) {
		var current = steps.shift();
		var adjacent = this.getAdjacents(current).filter(function(square) {
			return self.world.passable(square, ignoreableTypes);
		});
		adjacent.forEach(function(square) {
			square.d = current.d + 1;
		});

		for(let a=0; a<adjacent.length; a++) {
			var adj = adjacent[a];

			var existing = board.getAt(adj.x, adj.z);

			if(existing && existing.d <= adj.d) {
				adjacent.splice(a, 1);
				a--;
			}
			else {
				if(existing) {
					board.remove(existing);
				}
				board.add(adj, adj.x, adj.z);
			}
		}

		steps = steps.concat(adjacent);
		if(board.getAt(from.x, from.z)) {
			break;
		}
	}

	//console.log(board);

	var loop = from;
	var route = [from];
	while(loop && (loop.x !== to.x || loop.z !== to.z)) {
		var weight = board.getAt(loop.x, loop.z).d;
		var passableAdjacents = this.getRandomisedAdjacents(loop)
			.filter(function(square) {
				return self.world.passable(square, ignoreableTypes) && board.getAt(square.x, square.z);
			})
			.map(function(square) {
				return board.getAt(square.x, square.z);
			});
		loop = passableAdjacents.find(function(adj) {
			return adj.d === weight - 1;
		});
		route.push(loop);
	}

	if(!loop) {	// Ran out of viable adjacents/couldn't find a route from->to (eg, because it's impassable)
		route = null;
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
module.exports = {
	container: null,
	assets: null,
	viewUnitsPerWorldUnitX: null,
	viewUnitsPerWorldUnitZ: null,
	world: null,

	isIsometric: false,
	animationDuration: 2,
	interactionEnabled: false,
	worldUpdatesPerSecond: 6,
	running: true,

	worldClass: "renderer-world",
	objectBoundsClass: "renderer-object-bounds",
	objectClass: "renderer-object",

	init: function(element, world, worldUpdatesPerSecond, assets) {
		this.world = world;

		this.viewUnitsPerWorldUnitX = element.offsetWidth / world.width;
		this.viewUnitsPerWorldUnitZ = element.offsetHeight / world.depth;

		this.worldUpdatesPerSecond = worldUpdatesPerSecond;
	
		this.container = element;
		this.container.classList.add(this.worldClass);

		this.assets = assets;

		this.injectStyles();

		this.styleElement(this.container, {
			backgroundColor: "#308000"
		});
		this.container.classList.add("interactable");

		this.setIsometric(this.isIsometric);
	},
	injectStyles: function() {
		var style = document.createElement("style");
		style.innerText = `
.${this.worldClass}, .${this.objectClass} {
	transition: transform 0s, bottom 0s, right 0s, width 0s, height 0s;
}
.animating {
	transition-duration: ${this.animationDuration}s;
}
.isometric {
	transform: scaleY(0.5) rotateZ(45deg);
}
.${this.objectBoundsClass} {
	position: absolute;
	pointer-events: none;
	transition: transform ${1/this.worldUpdatesPerSecond}s linear 0s;
}

.${this.objectClass} {
	position: absolute;
	pointer-events: none;

	right: 50%;
	bottom: 50%;
	transform: translate(50%, 50%);
	width: 100%;
	height: 100%;
}
.${this.objectClass}.interactable {
	pointer-events: auto;
}
.${this.objectClass}.interactable:hover {
	transform: translate(50%, 50%) scale(1.25);
}

.${this.objectClass}.activated {
	animation-name: opening !important;
	animation-iteration-count: 1;
	animation-duration: 0.15s;
	animation-fill-mode: both;
}

.isometric .${this.objectClass} {
	transform: rotateZ(-45deg) scaleY(2);
	right: 27.5%;
    bottom: 30.5%;
    width: 145%;
	height: 145%;
}
.isometric .${this.objectClass}.interactable:hover {
	transform: rotateZ(-45deg) scaleY(2) scale(1.25);
}

@keyframes opening {
  0% { background-image: url("chest-1.png"); }
  20% { background-image: url("chest-2.png"); }
  40% { background-image: url("chest-3.png"); }
  60% { background-image: url("chest-4.png"); }
  80% { background-image: url("chest-5.png"); }
  100% { background-image: url("chest-6.png"); }
}
`;
		document.head.appendChild(style);
	},

	beginAnimation: function() {
		this.interactionEnabled = false;
		this.container.classList.add("animating");
		this.container.querySelectorAll("."+this.worldClass+", ."+this.objectClass).forEach(function(el) {
			el.classList.add("animating");
		});

		var transitionEndHandler = function(e) {
			if(e.target === this.container) {
				this.endAnimation();
			}
		}.bind(this);

		this.container.removeEventListener("webkitTransitionEnd", transitionEndHandler);
		this.container.removeEventListener("transitionEnd", transitionEndHandler);

		this.container.addEventListener("webkitTransitionEnd", transitionEndHandler);
		this.container.addEventListener("transitionEnd", transitionEndHandler);
	},

	endAnimation: function() {
		this.interactionEnabled = true;
		this.container.classList.remove("animating");
		this.container.querySelectorAll("."+this.worldClass+", ."+this.objectClass).forEach(function(el) {
			el.classList.remove("animating");
		});
	},

	setIsometric: function(isometric) {
		this.isIsometric = (typeof isometric === "undefined") ? true : !!isometric;

		if(this.animationDuration > 0) {
			this.beginAnimation();
		}

		if(this.isIsometric) {
			this.container.classList.add("isometric");
		}
		else {
			this.container.classList.remove("isometric");
		}
	},

	toViewCoordinatesX: function(length) {
		return length * this.viewUnitsPerWorldUnitX;
	},
	toViewCoordinatesZ: function(length) {
		return length * this.viewUnitsPerWorldUnitZ;
	},
	toWorldCoordinatesX: function(length) {
		return Math.floor(length/this.viewUnitsPerWorldUnitX);
	},
	toWorldCoordinatesZ: function(length) {
		return Math.floor(length/this.viewUnitsPerWorldUnitZ);
	},

	startRenderLoop: function() {

		var frameDelay = 1000/this.worldUpdatesPerSecond;

		this.running = true;

		var prevTimestamp = 0;
		var leftOver = 0;

		var step = function(timestamp) {
			var elapsedTime = (timestamp - prevTimestamp);	// Time since last call to requestAnimationFrame()
			if(this.running) {

				elapsedTime += leftOver;	// *Running* time since last call to world.step()

				while(elapsedTime >= frameDelay) {
					this.world.step();	// For each frame that should have been calculated according to the fps, step the world
					elapsedTime -= frameDelay;
				}

				// Save any leftover time (< 1 frameDelay) so inconsistent requestAnimationFrame() calls don't result in
				// inconsistent world-stepping (jerky browser rendering shouldn't make the *world* jerky, just our view of it)
				leftOver = elapsedTime;
				
				// And finally render the final state of the world
				this.render();
			}
			// and record the current timestamp for next time
			prevTimestamp = timestamp;

			requestAnimationFrame(step);
		}.bind(this);

		requestAnimationFrame(step);
	},

	unpauseRenderLoop: function() {
		this.running = true;
	},

	pauseRenderLoop: function() {
		this.running = false;
	},

	render: function() {
		var obj;
		Object.keys(this.world.objects).forEach(function(id) {
			obj = this.world.objects[id];

			var objectElement = obj.rendererObject.querySelector("." + this.objectClass);

			var objRoles = obj.getRoles();
			objRoles = objRoles.join(" ");

			if(objectElement.className !== objRoles) {
				objectElement.className = objRoles;
			}

			obj.rendererObject.style.zIndex = (obj.z * this.world.width) + obj.x;
			obj.rendererObject.style.transform = "translate(" + this.toViewCoordinatesX(obj.x) + "px, " + this.toViewCoordinatesZ(obj.z) + "px)";
		}.bind(this));
	},

	createObjectElement: function(key, colour, obj, eventHandlers) {

		var el = this.createElement("div", {
			"className": this.objectBoundsClass
		}, {
			width: this.viewUnitsPerWorldUnitX + "px",
			height: this.viewUnitsPerWorldUnitZ + "px",
			"background-color": colour
		});
		
		var sprite = this.assets.new(key);
		obj.set(this.objectClass);
		sprite.className = obj.getRoles().join(" ");

		el.appendChild(sprite);

		if(eventHandlers) {
			Object.keys(eventHandlers).forEach(function(event) {
				sprite.addEventListener(event, function(e) {
					eventHandlers[event].call(obj, e);
				});
			});
		}

		return el;
	},

	createElement: function(tag, attribs, style) {
		var el = document.createElement(tag);

		attribs = attribs || {};

		Object.keys(attribs).forEach(function(attrib) {
			el[attrib] = attribs[attrib];
		});

		this.styleElement(el, style);
		return el;
	},

	styleElement: function(el, style) {
		style = style || {};

		Object.keys(style).forEach(function(attrib) {
			el.style[attrib] = style[attrib];
		});
	}
};
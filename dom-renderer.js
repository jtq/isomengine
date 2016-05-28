module.exports = {
	container: null,
	assets: null,
	viewUnitsPerWorldUnitX: null,
	viewUnitsPerWorldUnitZ: null,
	isIsometric: false,

	worldClass: "world",
	objectBoundsClass: "object-bounds",
	objectClass: "object",

	init: function(element, world, assets) {
		this.viewUnitsPerWorldUnitX = element.offsetWidth / world.width;
		this.viewUnitsPerWorldUnitZ = element.offsetHeight / world.depth;
	
		this.container = element;
		this.container.classList.add(this.worldClass);

		this.assets = assets;

		this.injectStyles();

		this.styleElement(this.container, {
			backgroundColor: "#308000",
			"pointer-events": "auto"
		});

		this.setIsometric(this.isIsometric);
	},
	injectStyles: function() {
		var style = document.createElement("style");
		style.innerText = `
.${this.worldClass}, .${this.objectClass} {
	transition: transform 2s, bottom 2s, right 2s, width 2s, height 2s;	/* Set transition times when moving into isomatric view */
}
.isometric {
	transform: scaleY(0.5) rotateZ(45deg);
}
.${this.objectBoundsClass} {
	position: absolute;
	pointer-events: none;
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
.isometric .${this.objectClass} {
	transform: rotateZ(-45deg) scaleY(2);
	right: 27.5%;
    bottom: 30.5%;
    width: 145%;
	height: 145%;
}
`;
		document.head.appendChild(style);
	},

	setIsometric: function(isometric) {
		this.isIsometric = (typeof isometric === "undefined") ? true : !!isometric;

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

	render: function(world) {
		var obj;
		Object.keys(world.objects).forEach(function(id) {
			obj = world.objects[id];
			obj.element.style.zIndex = (obj.z * world.width) + obj.x;
			obj.element.style.transform = "translate(" + this.toViewCoordinatesX(obj.x) + "px, " + this.toViewCoordinatesZ(obj.z) + "px)";
		}.bind(this));
	},

	createObjectElement: function(key, colour) {
		var el = this.createElement("div", {
			"className": this.objectBoundsClass
		}, {
			width: this.viewUnitsPerWorldUnitX + "px",
			height: this.viewUnitsPerWorldUnitZ + "px",
			"background-color": colour
		});
		
		var sprite = this.assets.new(key);
		sprite.className = this.objectClass;

		el.appendChild(sprite);

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
module.exports = {
	container: null,
	viewUnitsPerWorldUnitX: null,
	viewUnitsPerWorldUnitZ: null,
	isIsometric: false,

	worldClass: "world",
	objectBoundsClass: "object-bounds",
	objectClass: "object",

	init: function(element, world) {
		this.viewUnitsPerWorldUnitX = element.offsetWidth / world.width;
		this.viewUnitsPerWorldUnitZ = element.offsetHeight / world.depth;
	
		this.container = element;
		this.container.classList.add(this.worldClass);

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
	transition: transform 2s, left 2s, bottom 2s;	/* Set transition times when moving into isomatric view */
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

	transform: translateX(-50%);
	left: 50%;
	bottom: 0%;
	transform: translateX(-50%);
}
.isometric .${this.objectClass} {
	transform: translateX(-50%) rotateZ(-45deg) scaleY(2) translate(-50%, -25%);
	left: 75%;
	bottom: 25%;
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

	createObjectElement: function(pic, colour) {
		var el = this.createElement("div", {
			"className": this.objectBoundsClass
		}, {
			//transition: "transform 1s",
			width: this.viewUnitsPerWorldUnitX + "px",
			height: this.viewUnitsPerWorldUnitZ + "px",
			"background-color": colour
		});
		var img = this.createElement("img", {
			src: pic,
			"className": this.objectClass
		}, null);
		el.appendChild(img);

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
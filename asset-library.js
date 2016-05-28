var config = require("./library.json");

module.exports = {
	new: function(key) {
		var conf = config[key];
		var sprite = document.createElement("div");
		sprite.style.backgroundImage = "url(" + conf.sprite + ")";
		sprite.style.backgroundRepeat = "no-repeat";
		sprite.style.backgroundSize = "contain";
		return sprite;
	}
};
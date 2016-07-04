'use strict';

module.exports = {
	linear: function(start, end, duration, progress) {
		var range = end - start;
		return range*progress/duration + start;
	},
	quadIn: function (start, end, duration, progress) {
		var range = end - start;
		progress /= duration;
		return range*progress*progress + start;
	}
};
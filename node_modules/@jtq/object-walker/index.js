'use strict';

// Walk a tree of objects and call a callback on every simple (non-object, non-array) value
function walk(obj, callback, path) {

	path = path ? path+"." : "";

	Object.keys(obj).forEach(function(key) {
		var value = obj[key];
		var newPath = path+key;
		if(value instanceof Object) {
			walk(value, callback, newPath);
		}
		else {
			callback(value, newPath);
		}
	});
};

// Given an object and path ("obj.key.key.key") return the value of the variable at that path
function get(obj, path) {

	var keys = path.split(".");

	keys.forEach(function(key) {
		obj = obj[key];
	});

	return obj;
};

// Given an object and path ("obj.key.key.key") set the value of the variable at that path
function set(obj, path, value) {

	var keys = path.split(".");

	keys.forEach(function(key, index) {
		if(index === keys.length-1) {
			obj[key] = value;
		}
		else {
			obj = obj[key];
		}
	});
};

module.exports = {
	walk: walk,
	get: get,
	set: set
};
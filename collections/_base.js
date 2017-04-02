if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore','backbone','../models/foo.js'], function(_, Backbone, FooModel){
	return Backbone.Collection.extend({
		model: FooModel
	});
});
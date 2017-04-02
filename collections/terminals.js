if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore','backbone','../models/terminal.js'], function(_, Backbone, TerminalModel){
	return Backbone.Collection.extend({
		model: TerminalModel,

		getFrees: function(){
			return this.where({free:true});
		}
	});
});
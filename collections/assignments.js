if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore','backbone','../models/assignment.js'], function(_, Backbone, AssignmentModel){
	return Backbone.Collection.extend({
		model: AssignmentModel,

		getForTerminal: function(terminal){
			return this.find(function(assignment){
				return (assignment.terminal.id==terminal.id);
			});
		}
	});
});
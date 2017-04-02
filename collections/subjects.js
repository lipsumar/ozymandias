if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore','backbone','../models/subject.js'], function(_, Backbone, SubjectModel){
	return Backbone.Collection.extend({
		model: SubjectModel,

		comparator : function(subject) {
			return (subject.get('numberOfTaskDone') + subject.get('blameCount'));
		},

		getFrees: function(){
			return this.where({
				free: true,
				rejected: false
			});
		},

		getWithTasksLeft: function(){
			return this.where({
				hasPossibleTaskLeft: true,
				rejected: false
			});
		},

		cancelTask: function(task){
			this.each(function(subject){
				subject.cancelTask(task);
			});
		}
	});
});
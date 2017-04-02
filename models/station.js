if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore', 'backbone'], function(_, Backbone){
	return Backbone.Model.extend({
		defaults:{
			title: 'untitled station',
			free: true
		},
		setTasks: function(tasks){
			this.tasks = tasks;
		},
		getTasks: function(level){
			return _.filter(this.tasks, function(task){
				return _.contains(task.get('levels'), level.id);
			});
		},
		toString: function(){
			return '[Station '+this.id+']';
		}
	});
});
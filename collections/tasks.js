if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore','backbone','../models/task.js'], function(_, Backbone, TaskModel){
	return Backbone.Collection.extend({
		model: TaskModel,
		getForStation: function(station){
			return this.filter(function(task){
				return _.contains(task.get('canExecuteOnStations'), station.id);
			});
		},

		// @TODO implement task filtering
		getPossibleForSubject: function(subject){
			return this.filter(function(task){
				return true;
			});
		}
	});
});
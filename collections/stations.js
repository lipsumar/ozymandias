if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore','backbone','../models/station.js'], function(_, Backbone, StationModel){
	return Backbone.Collection.extend({
		model: StationModel,

		// returns an array of all stations that can be used by a given terminal
		getForTerminal: function(terminal){
			return this.filter(function(station){
				return (_.indexOf(terminal.get('canExecuteAtStations'), station.id) > -1);
			});
		},
		// returns an array of all stations that can be used by a given task
		getForTask: function(task){
			return this.filter(function(station){
				return (_.indexOf(task.get('canExecuteOnStations'), station.id) > -1);
			});
		}
	});
});
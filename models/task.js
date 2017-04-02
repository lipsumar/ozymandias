if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore', 'backbone'], function(_, Backbone){
	return Backbone.Model.extend({
		defaults: {
			title: "Untitled task",
			numberOfParticipants: null, // int
			canExecuteOnStations: null // int array
		},
		setStations: function(stations){
			this.stations = stations;
			console.log(this+'.setStations = '+stations[0]);
		},
		getStation: function(){
			return this.stations[0];///@TODO vary stations
		},

		/**
		 * Return true if there are still enough subjects for which it is possible
		 * @param  {array[Subject]}  subjectsWithTaskLeft array of subjects that still have tasks left
		 * @return {Boolean}
		 */
		isPossible: function(subjectsWithTaskLeft){
			var numberOfPossibleSubjects = 0;
			for (var i = 0; i < subjectsWithTaskLeft.length; i++) {
				subject = subjectsWithTaskLeft[i];
				if(subject.hasPossibleTask(this)){
					numberOfPossibleSubjects++;
				}
				if(numberOfPossibleSubjects>=this.get('numberOfParticipants')){
					return true;
				}
			}


			return false;
		},
		toString: function(){
			return '[Task '+this.id+']';
		}
	});
});
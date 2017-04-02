if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore', 'backbone'], function(_, Backbone){
	return Backbone.Model.extend({
		defaults: {
			free: true,
			canExecuteAtStations: null // int array
		},

		// set the stations this terminal can execute at
		setStations: function(stations){
			console.log('setStations for '+this+':'+stations.join(','));
			this.stations = stations;
		},

		getFreeStations: function(){
			var ret = _.filter(this.stations, function(st){ return st.get('free'); });
			//console.log(this+'.getFreeStations => '+ret);
			return ret;
		},

		getTaskAndStationForFreeSubjects: function(subjects){
			var freeStations = this.getFreeStations();
			//console.log('terminal #'+this.id+' found '+freeStations.length+' free stations');
			if(freeStations.length > 0){
				// from these stations, extract all tasks
				var availableTasks = [];
				_.each(freeStations, function(station){
					availableTasks = availableTasks.concat(station.getTasks(global.getCurrentLevel()));
				});
				availableTasks = _.uniq(availableTasks);
				//console.log('all tasks available:', availableTasks.length);

				if(availableTasks.length > 0){
					// remove tasks we can't perform given the subjects
					availableTasks = _.filter(availableTasks, function(task){
						return subjects.length >= task.get('numberOfParticipants');
					});
					//console.log('available tasks:', _.map(availableTasks, function(t){ return t.get('title'); }));
					/*if(availableTasks.length===0){
						console.log('no task available after removing undoables :(');
					}*/


					// for each task, see if a subset of freeSubjects could do it
					var hasPossibleTaskFilter = function(subject){ return subject.hasPossibleTask(task); };
					var possibles = [];
					for (var i = 0; i < availableTasks.length; i++) {
						var task = availableTasks[i];
						var subjectsUpToTheTask = _.filter(subjects, hasPossibleTaskFilter);
						if(subjectsUpToTheTask.length >= task.get('numberOfParticipants')){
							// ok, this is a task we can run with these subjects
							possibles.push({
								task: task,
								taskSort: task.get('priority'),
								subjects: subjectsUpToTheTask
							});
						}
					}


					if(possibles.length>0){
						//some combinations are possible, select the best
						var bestPossible = _.sortBy(possibles, 'taskSort')[0];

						return {
							task: bestPossible.task,
							station: bestPossible.task.getStation(),
							subjects: bestPossible.subjects
						};
					}

					//console.log('! no possible');


				}
			}
			return false;
		},
		toString: function(){
			return '[Terminal '+this.id+']';
		}

	});
});
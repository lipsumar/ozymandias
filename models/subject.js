if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore', 'backbone'], function(_, Backbone){
	return Backbone.Model.extend({
		defaults: {
			free: false,
			status: 'inactive',
			numberOfTaskDone: 0,
			loggedOnTerminal: null, //int
			hasPossibleTaskLeft: null,

			possibleTasks: null,
			blameCount: 0,
			rejected: false,
			scores: null
		},

		initialize: function(){

			this.statusHistory = [];
			this.blames = [];
			this.set('scores', [], {silent:true});
			this.on('change:status', this.statusChanged);
		},

		/**
		 * set *all* the tasks a subject could perform
		 * @param {array[Task]} tasks
		 */
		setPossibleTasks: function(tasks){
			this.possibleTasks = tasks;
			this.set('hasPossibleTaskLeft', (this.possibleTasks.length > 0 ? true : false));
		},

		getPossibleTasks: function(){
			return this.possibleTasks;
		},

		hasPossibleTask: function(task){
			return _.contains(this.possibleTasks, task);
		},

		cancelTask: function(task){
			var pt = _.reject(this.possibleTasks, function(t){
				return t.id == task.id;
			});
			this.setPossibleTasks(pt);
		},

		statusChanged: function(){
			var status = this.get('status'),
				historyItem = {
					status: status,
					time: global.timer.getTime()
				};

			if(status==='working'){
				historyItem.station = this.assignment.station.id;
				historyItem.terminal = this.assignment.terminal.id;
				historyItem.task = this.assignment.task.id;
				historyItem.taskTitle = this.assignment.task.get('title');
			}
			this.statusHistory.push(historyItem);
		},

		/**
		 * called when a task has been finished
		 * @param {Task} task
		 */
		addTaskDone: function(task){
			this.set('numberOfTaskDone', this.get('numberOfTaskDone')+1);
			var pt = _.reject(this.possibleTasks, function(t){
				return t.id == task.id;
			});
			this.setPossibleTasks(pt);
		},

		addScore: function(assignment, score){
			this.get('scores').push({
				assignmentId: assignment.id,
				taskId: assignment.task.id,
				score: score
			});
		},

		startIdle: function(){
			this.set({
				status: 'idle',
				free: true
			});
		},

		blame: function(assignment){
			this.set('blameCount', this.get('blameCount')+1);
			this.blames.push({
				time: global.timer.getTime(),
				assignmentId: assignment.id
			});
			this.trigger('blame', this.toJSON());
			if(this.get('blameCount')===3){
				this.set('rejected', true);
			}
		},
		toJSON: function(){
			var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
			if(json.status==='assigned'){
				json.assignedStation = this.assignment.station.toJSON();
				json.timeMax = this.assignment.getTimeoutDuration();
				json.timeLeft = this.assignment.getTimeLeft();
			}
			return json;
		},
		toString: function(){
			return '[Subject '+this.id+']';
		}
	});
});
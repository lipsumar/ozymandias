	if (typeof define !== 'function') { var define = require('amdefine')(module); }
var exec  = require('child_process').exec;
define(['underscore','backbone',
	'../models/triggerOnce',
	'../models/assignment.js',
	'../collections/assignments.js'],function(_, Backbone, TriggerOnce, AssignmentModel, AssignmentCollection){
//
	var watchI = 0;
	var watchInterval = 300;
	var watching = false;
	var assignmentCount = 0;


	var AssignmentController = function(terminals, subjects, levels, mayCreateAssignment){
		var that = this;
		this.terminals = terminals;
		this.subjects = subjects;
		this.assignments = new AssignmentCollection();
		this.levels = levels;
		this.mayCreateAssignment = mayCreateAssignment || this.mayCreateAssignment;
		this.listenTo(this.assignments, 'add', function(assignment){ that.trigger('assignment:added', assignment); });
		this.listenTo(this.assignments, 'cancelled', this.removeAssignment.bind(this));
	};

	AssignmentController.prototype.startWatching = function() {
		if(watching){
			throw 'AssignmentController: tried to startWatching while already watching.';
		}
		console.log('start watching');

		this.clearTriggerOnce('level:over');
		this.clearTriggerOnce('level:clear');

		watching = true;
		this.watch();
	};

	/**
	 * This is the loop watching what action is to be taken
	 * this is in charge of trying to assign all the time and stop when a level is over
	 * @return {[type]} [description]
	 */
	AssignmentController.prototype.watch = function() {
		watchI++;
		var subjectsWithTaskLeft = this.subjects.getWithTasksLeft();

		// check for possible tasks that are impossible to assign
		if(watchI % 20 === 0){
			this.removeImpossibleTasks(subjectsWithTaskLeft);
		}

		// anyone has to do anything left at all ?
		if(subjectsWithTaskLeft.length===0){
			this.end();
			return;
		}


		// is level over ?
		if(this.levels.current.isOver()){
			// level is over, stop assigning
			this.triggerOnce('level:over', this.levels.current);
			// wait for assignments to clear
			if(this.assignments.length===0){
				// all clear
				this.stopWatching();
				this.levels.current.isClear = true;
				this.triggerOnce('level:clear', this.levels.current);

			}

		}else{
			if(this.mayCreateAssignment()){
				this.assign();
			}

		}




		// and finally loop
		if(watching){
			setTimeout(this.watch.bind(this), global.timer.getDuration(watchInterval));
		}
	};

	AssignmentController.prototype.stopWatching = function() {
		watching = false;
	};


	/**
	 * To be overided by an assignmentPanel to avoid creating too many assignments
	 * @return {boolean}
	 */
	AssignmentController.prototype.mayCreateAssignment = function() {
		throw new Error('assignment controller has no mayCreateAssignment() regulator: You must call OP.setAssignmentRegulator()');
	};

	/**
	 * This is in charge of finding free terminals/subjects and assign them
	 * @return {[type]} [description]
	 */
	AssignmentController.prototype.assign = function() {
		var freeTerminals = this.terminals.getFrees(),
			freeSubjects  = this.subjects.getFrees();

		//console.log('watch: found '+freeTerminals.length+' free terminals and '+freeSubjects.length+' free subjects.');

		// is there any free terminal or subject
		if(freeTerminals.length > 0 && freeSubjects.length > 0){
			// ok, we can assign
			_.each(freeTerminals, _.bind(function(terminal){
				// terminal, can you execute anything ?
				var assignmentObjects = terminal.getTaskAndStationForFreeSubjects(freeSubjects);
				//console.log(assignmentObjects);
				if(assignmentObjects && this.mayCreateAssignment()){
					//var selectedFreeSubjects = _.first(assignmentObjects.subjects, assignmentObjects.task.get('numberOfParticipants'));
					var selectedFreeSubjects = _.first(_.shuffle(assignmentObjects.subjects), assignmentObjects.task.get('numberOfParticipants'));

					// hold on tiger, do we have enough time for that task ?
					if(this.levels.current.id===2 || (!this.levels.current.isOver() && this.levels.current.getRemainingTime() >= assignmentObjects.task.get('duration')/2)){
						//@TODO "terminal.stations[0]" is cheating when 1 terminal = 1 station.
						this.createAssignment(selectedFreeSubjects, terminal.stations[0], assignmentObjects.task, terminal);
					}else{
						console.log('assignment creation canceled');
					}


					//refresh freeSubjects
					freeSubjects = this.subjects.getFrees();
				}
			},this));

		}
	};

	AssignmentController.prototype.createAssignment = function(subjects, station, task, terminal) {
		//first make sure all sbjects are actually not assigned
		_.each(subjects, function(subject){
			if(subject.assignment){
				throw 'Error: trying to assign a subject already assigned ! subject #'+subject.id;
			}
		});
		var assignment = new AssignmentModel({id: assignmentCount}, {
			subjects: subjects,
			station:station,
			task: task,
			terminal:terminal
		});
		console.log(assignment+' created');
		console.log('for subjects:', subjects.map(function(s){return s.id}));
		this.assignments.add(assignment);
		assignmentCount++;
	};

	AssignmentController.prototype.assignmentComplete = function(assignment, scores) {
		assignment.complete(scores);
		this.removeAssignment(assignment);
		this.trigger('assignment:complete', assignment);
	};

	AssignmentController.prototype.removeAssignment = function(assignment) {
		if(arguments.length!==1){
			throw 'AssignmentController.removeAssignment called with wrong arguments';
		}
		this.assignments.remove(assignment);

	};

	AssignmentController.prototype.removeImpossibleTasks = function(subjectsWithTaskLeft) {
		var that = this,
			tasksCheckedAsPossible = {};
		_.each(subjectsWithTaskLeft, function(subject){
			var tasks = subject.getPossibleTasks();
			_.each(tasks, function(task){
				if(tasksCheckedAsPossible[task.id]) return;

				if(!task.isPossible(subjectsWithTaskLeft)){
					// cancel this task for subjects with it
					console.log('task '+task.get('title')+' is now impossible, cancelling it.');
					that.subjects.cancelTask(task);
				}else{
					tasksCheckedAsPossible[task.id] = true;
					//console.log('task '+task.get('title')+' is still possible');
				}
			});
		});
	};

	AssignmentController.prototype.end = function() {
		console.log('That‘s all folks!');
		watching = false;
		this.subjects.invoke('set', {status:'inactive'});
		this.trigger('session:end');
	};

	_.extend(AssignmentController.prototype, Backbone.Events);
	_.extend(AssignmentController.prototype, TriggerOnce);


	return AssignmentController;

});
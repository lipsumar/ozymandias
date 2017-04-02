var _ = require('underscore')._,
	Backbone = require('backbone'),
	timeRatio = 1,
	LevelCollection = require('../collections/levels.js'),
	SubjectCollection = require('../collections/subjects.js'),
	TaskCollection = require('../collections/tasks.js'),
	StationCollection = require('../collections/stations.js'),
	TerminalCollection = require('../collections/terminals.js'),
	AssignmentController = require('../controllers/assignment.js'),
	timer = require('../models/timer.js'),

	levels = new LevelCollection(),
	subjects = new SubjectCollection(),
	tasks = new TaskCollection(),
	stations = new StationCollection(),
	terminals = new TerminalCollection(),
	assignmentController = new AssignmentController(terminals, subjects, levels),

	fs = require('fs');

global.timer = timer;
global.getCurrentLevel = function(){
	return levels.current;
};

exports.vent = _.extend({}, Backbone.Events);
var vent = exports.vent;


// bubble up public events
assignmentController.on('all', function(){
	vent.trigger(arguments['0'], arguments['1']);
});
assignmentController.assignments.on('change:status', function(assignment){
	vent.trigger('assignment:'+assignment.get('status'), assignment);
});
subjects.on('blame', function(subject){
	vent.trigger('subject:blame', subject);
});


/**
 * set all levels
 * @param {array} levels array of level objects
 */
exports.setLevels = function(levelsData){
	var levelId = 0;
	_.each(levelsData, function(level){
		level.id = levelId;
		levels.add(level);
		levelId++;
	});
	levels.current = levels.at(0);
	console.log(levels.length+' levels configured.');
	console.log('currentLevel: '+levels.current);
};

exports.hasSubject = function(id){
	return subjects.get(id) ? true : false;
};
exports.addSubject = function(subjectData){
	if(typeof subjectData.id !== 'number' || isNaN(subjectData.id)){
		return false;
	}
	if(subjects.get(subjectData.id)){
		return false;
	}

	subjects.add(subjectData);
	vent.trigger('subject:added', _.clone(subjectData));
	return true;
};
exports.setSubjects = function(subjectsData){
	subjects.reset(subjectsData);
};
exports.getFullSubjects = function(){
	return subjects;
};

exports.setTasks = function(tasksData){
	// validate levels of tasks
	_.each(tasksData, function(taskData){
		_.map(taskData.levels, function(lvlId){
			if(!levels.get(lvlId)){
				throw 'Error: Tried to add a task for undefined level '+lvlId;
			}
		});
	});
	tasks.reset(tasksData);
};

exports.setStations = function(stationsData){
	stations.reset(stationsData);

	//set the tasks each station can execute
	stations.each(function(station){
		station.setTasks(tasks.getForStation(station));
	});

	//set the stations a task can execute at
	tasks.each(function(task){
		task.setStations(stations.getForTask(task));
	});
};

exports.setTerminals = function(terminalsData){
	// validate stations of terminals
	_.each(terminalsData, function(terminalData){
		_.map(terminalData.canExecuteAtStations, function(stationId){
			if(!stations.get(stationId)){
				throw 'Error: tried to add a terminal to an undefined station (terminal #'+terminalData.id+')';
			}
		});
	});


	terminals.reset(terminalsData);

	// set the stations a terminal can execute on
	terminals.each(function(terminal){
		terminal.setStations(stations.getForTerminal(terminal));
	});
};


exports.setTimeRatio = function(tr){
	timer.setFactor(tr);
};

exports.setAssignmentRegulator = function(regulator){
	assignmentController.mayCreateAssignment = regulator;
};


exports.getTimer = function(){
	return timer;
};

exports.getAssignments = function(){
	return assignmentController.assignments.toJSON();
};

exports.getAssignmentForTerminal = function(terminalId){
	var terminal = terminals.get(terminalId);
	if(terminal){
		return assignmentController.assignments.getForTerminal(terminal);
	}
	return null;
};

exports.getSubjects = function(){
	return subjects.toJSON();
};

exports.getTasks = function(){
	return tasks.toJSON();
};

exports.getLevels = function(){
	return levels.toJSON();
};

exports.getTerminals = function(){
	return terminals.toJSON();
};

exports.getCurrentLevel = function(){
	if(!levels.current){
		return false;
	}
	return levels.current.toJSON();
};






exports.assignmentComplete = function(terminalId, scores){
	var terminal = terminals.get(terminalId);
	if(!terminal){
		throw 'terminal "'+terminalId+'" not found';
	}
	var assignment = assignmentController.assignments.getForTerminal(terminal);
	if(!assignment){
		throw 'assignmentComplete called for terminal #'+terminalId+' but has no assignment.';
	}
	assignmentController.assignmentComplete(assignment, scores);
	subjects.sort();
};

exports.subjectLoggedOnTerminal = function(subjectId, terminalId){
	//is there an assignment for this terminal
	var terminal = terminals.get(terminalId),
		subject = subjects.get(subjectId),
		assignment = assignmentController.assignments.getForTerminal(terminal);
	if(!assignment){
		throw 'subjectLoggedOnTerminal called for subject #'+subjectId+' on terminal #'+terminalId+' but has no assignment.';
	}

	assignment.subjectLogin(subject);
	vent.trigger('subject:login', subject);
};

exports.forceStartAssignment = function(assignmentId){
	var assignment = assignmentController.assignments.get(assignmentId);
	if(assignment){
		console.log('Force start '+assignment);
		assignment.start();
	}
};


function setPossibleTasksToSubjects(){
	subjects.each(function(subject){
		subject.setPossibleTasks(tasks.getPossibleForSubject(subject));
	});
}


exports.startSession = function(){
	console.log('startSession! Time is '+global.timer.getTime());

	setPossibleTasksToSubjects();

	//startFirstLevel was here

	// make sure this function can not be called twice
	exports.startSession = function(){};

	vent.trigger('session:start');
};

exports.startFirstLevel = function(){
	subjects.invoke('startIdle');
	levels.current.start();
	assignmentController.startWatching();

	// make sure this function can not be called twice
	exports.startFirstLevel = function(){};
};


exports.startNextLevel = function(){
	console.log('=>startNextLevel');
	if(!levels.next()){
		throw 'ozy.startNextLevel called with no next level. Current: '+levels.current;
	}
	console.log('Starting '+levels.current+'! Time is '+global.timer.getTime());

	levels.current.start();
	assignmentController.startWatching();
};

exports.end = function(){
	assignmentController.end();
	console.log('This is the end');
};



exports.getOccupation = function(what){
	if(what==='subjects'){
		var actives = subjects.filter(function(s){ return s.get('status')!=='idle' && s.get('status')!=='inactive'; });
		return Math.round((actives.length / subjects.length) * 100);
	}
	if(what==='terminals'){
		var inactives = terminals.getFrees();
		return Math.abs(Math.round((inactives.length / terminals.length) * 100) - 100);
	}
};




/// //////////////////////////////////////////////////////////////
///
/// 	Saving / Retrieving state
/// 	!! This has never been used in production !!

exports.saveState = function(){
	var json = {
		subjects: subjects.toJSON()
	};
	var now = new Date();
	var fn = now.toISOString().split(':').join('_');

	fs.writeFile('./states/'+fn+'.json', JSON.stringify(json));
};

exports.canRecoverFrom = function(){
	return fs.readdirSync('./states/');
};

exports.tryToRecover = function(){
	var statesToRecoverFrom = this.canRecoverFrom();
	if(statesToRecoverFrom.length > 0){
		console.log('Recover from:');
		console.log('- '+statesToRecoverFrom.join('\n- '));

		vent.trigger('recover-possible', statesToRecoverFrom);
	}
};

exports.recoverState = function(stateJson){
	var state = JSON.parse(fs.readFileSync('./states/'+stateJson).toString());

	subjects.reset(state.subjects);

	console.log('restored state. '+subjects.length+' subjects ('+state.subjects.length+')');
};
var _ = require('underscore');
module.exports = function(ozy, subjects){
	var timer = ozy.getTimer();



	ozy.vent.on('all', function(eventName, eventParam){
		//console.log('==> '+eventName, eventParam);
		switch(eventName){

			case 'assignment:started':
				var assignment = eventParam;
				console.log('auto-play: setTimeout for assignment '+assignment.id, '->', timer.getDuration(assignment.task.get('duration')));
				setTimeout(function(assignment){
					console.log('auto-play: assignment '+assignment.id+' complete timeout');
					//console.log('assignment complete on terminal #'+assignment.terminal.id+' !');
					var scores = {};
					for (var i = 0; i < assignment.subjects.length; i++) {
						var mySubject = _.findWhere(subjects, {id:assignment.subjects[i].id});
						scores[assignment.subjects[i].id] = Math.round(Math.random()*100);
					}
					console.log('auto-play: ozy.assignmentComplete', assignment.id);
					ozy.assignmentComplete(assignment.terminal.id, scores);

				}.bind(this,assignment), timer.getDuration(assignment.task.get('duration')));
				break;

			case 'assignment:completed':
			case 'assignment:cancelled':
				console.log(':event:', eventName, 'assignment '+eventParam.id);
				var assignment = eventParam;
				for (var i = 0; i < assignment.subjects.length; i++) {
					var mySubject = _.findWhere(subjects, {id:assignment.subjects[i].id});
					mySubject.noticedAssignment=false;
					console.log('auto-play: #'+mySubject.id+' noticedAssignment=false');
				}
				break;
		}
	});




	var assignmentThatShouldForceStart = {};
	//simulate subjects watching the assignment screen every X seconds
	function subjectsWatch(){
		var assignments = ozy.getAssignments(),
			myAssignmentsFilter = function(a){  return (_.indexOf(_.pluck(a.subjects,'id'), subjects[i].id)>-1); };

		for (var i = 0; i < subjects.length; i++) {
			if(subjects[i].quit){
				//console.log('subject #'+subjects[i].id+' is a quitter');
				continue;
			}
			if(subjects[i].noticedAssignment){
				//console.log('subject #'+subjects[i].id+' already noticed');
				continue;
			}
			var myAssignments = _.filter(assignments, myAssignmentsFilter);
			if(myAssignments.length>1) throw 'Multiple assignments for a single subject. Are you nuts ?';
			if(myAssignments.length > 0){
				//console.log('subject #'+subjects[i].id+' found his assignment !');
				subjects[i].noticedAssignment = true;

				//login
				setTimeout(function(sub, ass){
					//console.log('subject #'+subjects[i].id+' logs in !');
					ozy.subjectLoggedOnTerminal(sub.id, ass.terminal.id);
				}.bind(this, subjects[i], myAssignments[0]), timer.getDuration(10000));



			}else{
				//console.log('subject #'+subjects[i].id+' is not assigned');
			}
		}

		// refresh assignments
		assignments = ozy.getAssignments();
		/*for (var i = 0; i < assignments.length; i++) {
			if(assignments[i].status !== 'started'){
				if(!assignmentThatShouldForceStart[assignments[i].id]){
					assignmentThatShouldForceStart[assignments[i].id] = 1;
					continue;
				}
				// if not started at this point, force start it
				ozy.forceStartAssignment(assignments[i].id);
			}
		}*/

		setTimeout(subjectsWatch, timer.getDuration(5000));
	}


	subjectsWatch();
}

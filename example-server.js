// boiler plate modules
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	_ = require('underscore')._;

// ozymandias modules
var ozy = require('./controllers/ozymandias.js'),
	timer = ozy.getTimer(),
	monitor = require('./monitor.js'),
	sockets = {};


// load a configuration
var config = require('./data/config/example.js');



if(typeof monitor !== 'undefined'){
	monitor.init(ozy);
}


// Configure Express
app.configure(function () {
	app.use(express.bodyParser());
});

// Routes
// Routes - static
app.use(express.static('public'));
app.use('/node_modules',express.static('node_modules'));


// Routes - API
app.post('/ozymandias/add-subject', function(req, res){

	var subjectData = {
		id: parseInt(req.body.id, 10)
	};

	if(ozy.hasSubject(subjectData.id)){
		res.send({success:false, reason: 'id already in use'});
	}else{
		if(ozy.addSubject(subjectData)){
			ozy.saveState();

			res.send({success:true, subject: subjectData});
		}else{
			res.send({success:false, reason: 'unable to add subject'});
		}
	}

	res.end();
});


app.post('/ozymandias/start', function(req, res){

	ozy.startSession();
	res.end();
});

app.post('/ozymandias/subject-logged-in', function(req, res){
	if(req.body.subjectId && req.body.terminalId){
		//@TODO validate ids
		ozy.subjectLoggedOnTerminal(req.body.subjectId, req.body.terminalId);
		res.send({success:true, subjectId:req.body.subjectId, terminalId:req.body.terminalId});
	}
	res.end();
});

app.post('/ozymandias/force-start-assignment', function(req, res){
	var assignmentId = parseInt(req.body.assignmentId, 10);
	if(typeof assignmentId === 'number'){
		ozy.forceStartAssignment(assignmentId);
	}
	res.end();
});

app.post('/ozymandias/assignment-complete', function(req, res){

	if(req.body.terminalId && req.body.scores){
		var scores = req.body.scores.reduce(function(scores, sc){
			scores[sc.id] = parseInt(sc.value, 10);
			return scores;
		}, {});

		ozy.assignmentComplete(req.body.terminalId, scores);
		res.send({success:true});
	}
	res.end();
});


// we store all terminals, so when they
// first connect - unless they have a task set already - they
// reboot and reset any task previously set (by a previous instance of Ozymandias)
var terminalsBooted = {};

io.on('connection', function(socket){
	var terminalId = socket.handshake.query.TERMINAL_ID;
	if(!terminalId){
		// who is this guy ?
		console.log('!! client connected w/out ID');
		return;
	}


	console.log('Connexion of terminal '+terminalId+(!terminalsBooted[terminalId] ? ' (will reboot)' : ''));

	sockets[terminalId] = socket;

	//check if there is an assignment running for this terminal
	var assignment = ozy.getAssignmentForTerminal(terminalId);
	if(assignment){
		sockets[terminalId].emit('assignment:added', assignment.toJSON());
	}else{
		if(!terminalsBooted[terminalId]){
			sockets[terminalId].emit('reboot');
			terminalsBooted[terminalId]	= true;
		}
	}

});




ozy.setTimeRatio(10);
ozy.setLevels(config.levels);
ozy.setTasks(config.tasks);
ozy.setStations(config.stations);
ozy.setTerminals(config.terminals);
ozy.setAssignmentRegulator(function(){return true;});






////// listen to Ozy events
///

ozy.vent.on('session:start', function(){
	ozy.startFirstLevel();
});


ozy.vent.on('assignment:added', function(assignment){
	assignment.fullyDisplayed(); //call it directly, all subjects are displayed at all time.

	if(sockets[assignment.terminal.id]){
		sockets[assignment.terminal.id].emit('assignment:added', assignment.toJSON());
	}else{
		console.log('Socket missing for terminal '+assignment.terminal.id);
	}
});


ozy.vent.on('assignment:complete', function(assignment){
	console.log('assignmentComplete', assignment);
});

ozy.vent.on('level:over', function(level){
	console.log('Level '+(level.id+1)+' is over');
});

ozy.vent.on('level:clear', function(level){

	if(level.hasNext()){
		//we simply start the next level
		ozy.startNextLevel();
	}else{
		//last level reached, no next !
		console.log('end of last level');
		ozy.end();
		//process.exit(0);
	}
});



process.on('SIGINT', function(){
	console.log('');
	console.log('Interrupted by user');
	process.exit();
});


//app.listen(1337);
http.listen(1337);


// DEV ONLY
//generate a bunch of subjects
var numberOfSubjects = 50;//parseInt(CLI_OPTIONS['--subjects'], 10) || Math.round(12+Math.random()*35);//50;
var subjects = [];
for(var i=12;i<numberOfSubjects+12;i++){
	subjects.push({
		id: i
	});
}
ozy.setSubjects(subjects);
ozy.startSession();

require('./auto-play')(ozy, subjects);
//*/
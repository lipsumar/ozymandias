var _ = require('underscore'),
	blessed = require('blessed'),
	screen = blessed.screen({
		autoPadding: true,
		smartCSR: true
	}),
	sparkline = require('sparkline'),
	OZY,
	refreshRate = 1000;


var subjectLists = [],
	levelBox,levelProgress,timeBox,
	occupationSparks = {},
	occupationHistory = {
		subjects: new Array(40),
		terminals: new Array(40)
	};

screen.title = 'Ozymandias Monitor';


exports.init = function(ozy){

	OZY = ozy;

	timeBox = blessed.box({
		width:'100%',
		top:0,
		left:0
	});
	screen.append(timeBox);

	var subjectsBox = blessed.box({
		label: ' Subjects ',
		left: 0,
		top:1,
		bottom: 10,
		width: '33%',
		border: {
			type: 'line'
		},
	});
	subjectLists.push(blessed.list({
		tags: true,
		width: '50%'
	}));
	subjectLists.push(blessed.list({
		tags: true,
		width: '49%',
		left: '49%'
	}));
	subjectsBox.append(subjectLists[0]);
	subjectsBox.append(subjectLists[1]);
	screen.append(subjectsBox);



	var log = blessed.log({
		width: '100%',
		height: 10,
		bottom: 0,
		border:{
			type: 'line'
		},
		label: ' Log ',
		scrollable: true
	});
	screen.append(log);

	//log.add('-- log --');
	var cl = console.log;
	var consoleMsgs = [];
	console.log = function(){
		log.add.apply(log, arguments);
		consoleMsgs.push(Array.prototype.slice.call(arguments));
		//cl.apply(console, arguments);
	};
	process.on('exit', function(){
		consoleMsgs.forEach(function(cs){
			cl.call(console, cs);
		});
	});



	levelBox = blessed.box({
		width: '66%',
		height: 3,
		bottom: 10,
		left: '33%',
		label: ' ',
		border:{
			type: 'line'
		}
	});
	levelProgress = blessed.progressbar({
		orientation: 'horizontal',
		filled: 0,
		pch: '#'
	});
	levelBox.append(levelProgress);
	screen.append(levelBox);



	var occupationBox = blessed.box({
		label: ' Occupation ',
		width: '66%',
		left:'33%',
		bottom: 13,
		height:4,
		tags: true,
		border:{
			type:'line'
		}

	});
	var y = 0;
	_.each(occupationHistory, function(v, occupKey){
		var label = blessed.box({
			top:y,
			width:10,
			height:1,
			left:1,
			content: occupKey.charAt(0).toUpperCase() + occupKey.slice(1)
		});
		occupationBox.append(label);

		occupationSparks[occupKey] = blessed.box({
			top:y,
			left:11,
			height:1
		});
		occupationBox.append(occupationSparks[occupKey]);
		y++;
	});


	screen.append(occupationBox);


	screen.render();


	update();

};






function update(){

	if(OZY){

		timeBox.setContent(OZY.getTimer().getTime().toString());


		var subjects = OZY.getSubjects(),
			toSstring = function(subjects){
				return _.map(subjects, function(subject){
					var statusStr = {
						idle: '{#aaa-fg}<idle>{/}',
						inactive: '{#333-fg}<inactive>{/}',
						working: '{green-fg}<working>{/}',
						assigned: '{yellow-fg}<assigned>{/}'
					};

					var ss = statusStr[subject.status] ? statusStr[subject.status]  : '<'+subject.status+'>';

					return subject.id + (subject.id < 10 ? ' ':'') + '  ' + ss;
				});
			};

		if(subjects && subjects.length > 0){
			subjects = _.sortBy(subjects, 'id');

			//split subjects in 2 lists
			var subjectsSplit = [[], []];
			_.each(subjects, function(s){
				subjectsSplit[s.id <= 35 ? 0 : 1].push(s);
			});

			subjectLists[0].setItems(toSstring(subjectsSplit[0]));
			subjectLists[1].setItems(toSstring(subjectsSplit[1]));
		}


		// level
		var level = OZY.getCurrentLevel();
		//console.log(level);
		levelBox.setLabel(' Lvl '+(level.id+1)+'/'+OZY.getLevels().length+' ('+Math.round(level.percent)+'%) ');
		levelProgress.setProgress(level.percent);


		// occupation
		_.each(occupationHistory, function(v, occupKey){
			var curr = OZY.getOccupation(occupKey);
			occupationHistory[occupKey].push(curr);
			if(occupationHistory[occupKey].length > 40){
				occupationHistory[occupKey].shift();
			}
			occupationSparks[occupKey].setContent(sparkline(occupationHistory[occupKey], {min:0, max:100}) + ' ' + curr+'%');
		});

	}

	screen.render();

	refresh();
}


function refresh(){
	setTimeout(update, refreshRate);
}





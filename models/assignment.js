if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore', 'backbone'], function(_, Backbone){
	return Backbone.Model.extend({
		defaults: {
			status: 'ready' // {string} ready, waitingForSubject, started
							// - ready: idle [default]
							// - waitingForSubject: assignment started waiting for subjects
							// - started: once all subjects have logged in
							// - completed: task is done
							// - cancelled: task is cancelled
		},
		initialize: function(attributes, options){
			this.setStation(options.station);
			this.setTerminal(options.terminal);
			this.setSubjects(options.subjects);
			this.task = options.task;
		},

		startWaiting: function(){
			this.set('status', 'waitingForSubject');
			this.initializeTimeout();
		},

		initializeTimeout: function(){
			if(this.timeoutInt) return;// don't init twice
			this.timeoutStart = global.timer.getTime();
			this.timeoutInt = setTimeout(this.timeout.bind(this), this.getTimeoutDuration());
		},

		getTimeoutDuration: function(){
			return global.timer.getDuration(120000);//(120000);
		},

		getTimeLeft: function(){
			return ((this.timeoutStart.getTime() + this.getTimeoutDuration()) - global.timer.getTime().getTime());
		},

		setStation: function(station){
			this.station = station;
			this.station.set('free', false);
		},
		setTerminal: function(terminal){
			this.terminal = terminal;
			this.terminal.set('free', false);
		},

		setSubjects: function(subjects){
			var that = this;
			this.subjects = subjects;
			_.each(this.subjects, function(subject){
				subject.set({
					'free': false,
					'status': 'assigned'
				});
				subject.assignment = that;
			});
		},


		freeSubjects: function(taskDone, scores){
			_.each(this.subjects, _.bind(function(subject){
				subject.set({
					'free': true,
					'status': 'idle',
					'loggedOnTerminal': null
				});
				if(taskDone){
					subject.addTaskDone(this.task);
				}
				subject.assignment = null;
			},this));
			this.subjects = null;
		},

		freeStation: function(){
			this.station.set('free', true);
			this.station = null;
		},

		freeTerminal: function(){
			this.terminal.set('free', true);
			this.terminal = null;
		},

		// to be called by assignment display when it is able to display the assignment fully
		fullyDisplayed: function(){
			this.startWaiting();
		},

		complete: function(scores){
			console.log(this+' complete');
			this.set('status', 'completed');
			this.setScores(scores);
			this.freeSubjects(true);
			this.freeStation();
			this.freeTerminal();
			this.task = null;
			this.trigger('completed', this);
		},

		setScores: function(scores){
			_.each(this.subjects, function(subject){
				subject.addScore(this, scores[subject.id]);
			}, this);
		},

		cancelled: function(){
			console.log(this+' TIMEOUT: cancelled');
			this.set('status', 'cancelled');
			this.blameUnloggedSubjects();
			this.freeSubjects(false);
			this.freeStation();
			this.freeTerminal();
			this.task = null;
			this.trigger('cancelled', this);
		},

		subjectLogin: function(subject){
			subject.set('loggedOnTerminal', this.terminal.id);
			console.log(subject+' logged in on '+this.terminal+' for '+this);
			if(this.allSubjectsLoggedIn()){
				this.start(); // auto-start task
			}
		},

		start: function(){
			clearTimeout(this.timeoutInt);

			// this block only makes sense if assignment is force-started
			if(!this.allSubjectsLoggedIn()){

				if(this.subjects.length === this.getUnloggedSubjects().length){
					return;
				}

				// task starts with unlogged subject,
				// blame them and remove them
				this.blameUnloggedSubjects();
				this.removeAndFreeUnloggedSubjects();
			}

			console.log(this+' started');

			if(this.get('status')!=='waitingForSubject'){
				throw this+' started with a status != waitingForSubject ('+this.get('status')+')';
			}

			this.set('status', 'started');
			_.invoke(this.subjects, 'set', {status:'working'});
		},

		getUnloggedSubjects: function(){
			var unlogged = [];
			for (var i = 0; i < this.subjects.length; i++) {
				if(this.subjects[i].get('loggedOnTerminal')!==this.terminal.id){
					unlogged.push(this.subjects[i]);
				}
			}
			return unlogged;
		},

		removeAndFreeUnloggedSubjects: function(){
			var that = this;
			this.subjects = this.subjects.reduce(function(memo, subject){
				if(subject.get('loggedOnTerminal') === that.terminal.id){
					memo.push(subject); // you logged in, you stay bro
				}else{
					subject.set({ // bye bye
						'free': true,
						'status': 'idle',
						'loggedOnTerminal': null
					});
					subject.assignment = null;
				}
				return memo;

			},[]);
		},

		allSubjectsLoggedIn: function(){
			if(this.getUnloggedSubjects().length>0){
				return false;
			}
			return true;
		},

		blameUnloggedSubjects: function(){
			var unloggedSubjects = this.getUnloggedSubjects();
			console.log('blaming subjects. got '+this.subjects.length+', blaming '+unloggedSubjects.length);

			_.each(unloggedSubjects, function(subject){
				console.log('blame subject #'+subject.id);
				subject.blame(this);
			}, this);

		},

		timeout: function(){
			if(!this.allSubjectsLoggedIn()){
				this.cancelled();
			}else{
				var unlogged = this.subjects,
					logg = [];
				_.each(unlogged, function(us){
					logg.push(us+':'+us.get('loggedOnTerminal'));
				});
				throw new Error(this+' timed out while all subjects have logged in. terminal:'+this.terminal.id+', subjects:'+_.pluck(this.subjects, 'id')+' unlogged:'+logg.join(', '));
			}
		},

		toLongString: function(){
			return 'OP.Assignment{subjects:'+(this.subjects ? this.subjects.length : 'null')+', station: '+(this.station ? this.station.id : 'null')+', task: '+(this.task ? this.task.id : 'null')+', terminal: '+(this.terminal ? this.terminal.id : 'null')+'}';
		},
		toString: function(){
			return '[Assignment '+this.id+']';
		},

		toJSON: function(){
			var json = Backbone.Model.prototype.toJSON.call(this);
			json.subjects = [];
			_.each(this.subjects, function(s){ json.subjects.push(s.toJSON()); });
			json.station = this.station ? this.station.toJSON() : null;
			json.task = this.task ? this.task.toJSON() : null;
			json.terminal = this.terminal ? this.terminal.toJSON() : null;
			json.timeLeft = this.getTimeLeft();
			json.timeMax = this.getTimeoutDuration();

			return json;
		}
	});
});
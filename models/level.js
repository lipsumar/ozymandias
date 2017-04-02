if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore', 'backbone'], function(_, Backbone){
	return Backbone.Model.extend({
		defaults:{
			done: false
		},

		start: function(){
			this.set('startedAt', global.timer.getTime());
			console.log(this+' starts now ('+this.get('startedAt')+') '+this.get('startedAt').getTime());
			console.log(this+' will end at '+this.getEndTime()+'  '+this.getEndTime().getTime());
		},

		hasNext: function(){
			return this.collection.getNext() ? true : false;
		},

		isOver: function(){
			return global.timer.getTime() > this.getEndTime();
		},

		getEndTime: function(){
			return new Date(this.get('startedAt').getTime() + this.get('duration'));
		},

		getPercent: function(){
			var now = global.timer.getTime();

			if(this.get('startedAt') && now > this.get('startedAt') && now < this.getEndTime()){
				return ((now.getTime() - this.get('startedAt').getTime()) / this.get('duration')) * 100;
			}
			return false;
		},

		getRemainingTime: function(){
			var now = global.timer.getTime();
			return this.get('duration') - (now - this.get('startedAt').getTime());
		},

		toJSON: function(){
			var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
			json.percent = this.getPercent();
			return json;
		},

		toString: function(){
			return '[Level '+this.id+']';
		}
	});
});
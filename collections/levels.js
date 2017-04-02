if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['underscore','backbone','../models/level.js'], function(_, Backbone, LevelModel){
	return Backbone.Collection.extend({
		model: LevelModel,

		next: function(){
			if(!this.current.isOver()){
				throw 'Error: tried to switch to next level while current is not over. You crazy person.';
			}

			this.current.set('done',true);

			var next = this.getNext();
			if(!next){
				return false;
			}

			this.current = next;
			return this.current;
		},

		getNext: function(){
			return this.at(this.current.id+1);
		}
	});
});
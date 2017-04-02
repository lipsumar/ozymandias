if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([], function(){
	return {
		_triggeredOnce: {},
		triggerOnce: function(eventName){
			if(this._triggeredOnce[eventName]) return;
			this._triggeredOnce[eventName] = true;
			this.trigger.apply(this, arguments);
		},

		clearTriggerOnce: function(eventName){
			delete this._triggeredOnce[eventName];
		}
	};
});
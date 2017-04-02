var realOrigin = Date.now(),
	//virtualOrigin = realOrigin,
	virtualOrigin = new Date(2014, 5, 1, 20, 0, 0, 0).getTime(),
	factor = 10;


exports.setFactor = function(f){
	factor = f;
};

exports.getTime = function(){
	var time = Date.now();
	return new Date( virtualOrigin + ((time - realOrigin) * factor) );
};

exports.getDuration = function(realDuration){
	var virtualDuration = realDuration / factor;
	return virtualDuration >= 1 ? virtualDuration : 1;
};

exports.getRealDuration = function(duration){
	return duration * factor;
};
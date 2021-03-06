var async = require("async");
var areplace = require("async-replace");

exports.tss = function(t,d,c){
	if(d instanceof Array){
		var l = d.length, n = 0, o = ''; while(n !== l) o += tss(t,d[n++],c); return o;
	}
	
	if(typeof d !== 'object' || d === null) return '';
	
	var undefined, regex = /§(\w*)§/g;
	
	if(c === undefined || c === null) // no callback, replace with data or empty
		return	t.replace(regex,function(m,k){
				return (d[k] !== undefined)?d[k]:'';
			});
	
	if(c instanceof Function) // one global callback
		return	t.replace(regex,function(m,k){ return c.call(d,k); });
	
	return	t.replace(regex,function(m,k){ // keyword dedicated callback
			if(!(c[k] instanceof Function)) // keyword not get an associed callback
				return (d[k] !== undefined)?d[k]:''; // blit data or empty
			 
			if(d[k] === undefined) // virtual keyword
				return c[k].call(d);
			
			return c[k].call(d,d[k]); // in data keyword
		});
};

exports.tss.async = function (t,d,c,done){
	if(d instanceof Array){
		return async.map(d,function(e,done){
			exports.tss.async(t,e,c,done);
		},function(err,data){ done(null, data.join("") ); });
	}
	
	if(typeof d !== 'object' || d === null) return '';
	
	var undefined, regex = /§(\w*)§/g;
	
	if(c === undefined || c === null) // no callback, replace with data or empty
		return done(null, t.replace(regex,function(m,k){
			return (d[k] !== undefined)?d[k]:'';
		}) );
	
	if(c instanceof Function) // one global callback
		return	areplace(t,regex,function(m,k,o,s,done){
			var data = c.call(d,k,done); if(data !== undefined) done(null,data);
		},done);
	
	return	areplace(t,regex,function(m,k,o,s,done){ // keyword dedicated callback
			if(!(c[k] instanceof Function)) // keyword not get an associed callback
				return done(null, (d[k] !== undefined)?d[k]:'' ); // blit data or empty
			 
			if(d[k] === undefined){ // virtual keyword
				var data = c[k].call(d,done); if(data !== undefined) done(null,data); return;
			}
			
			// in data keyword
			var data = c[k].call(d,d[k],done); if(data !== undefined) done(null,data);
		},done);
}

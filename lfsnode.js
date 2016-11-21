var fs = require("fs");
var path = require("path");

module.exports = {

	load: function(fn){
		try {
			console.log("Processing: "+path.resolve(process.cwd(), fn));
			return fs.readFileSync(path.resolve(process.cwd(), fn))+'';
		} catch (e) {return null;}
	},
	loadRaw: function(fn){
		try {
			return fs.readFileSync(path.resolve(process.cwd(), fn));
		} catch (e) {return null;}
	},
	save: function(fn,data){
		fs.writeFileSync(path.resolve(process.cwd(), fn),data);
	},
	saveRaw: function(fn,data){
		fs.writeFileSync(path.resolve(process.cwd(), fn),new Buffer(data));
	}
	};


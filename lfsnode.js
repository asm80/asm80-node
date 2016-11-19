var fs = require("fs");
var path = require("path");

module.exports = {

	load: function(fn){
		try {
			console.log(path.resolve(__dirname, fn));
			return fs.readFileSync(path.resolve(__dirname, fn))+'';
		} catch (e) {return null;}
	},
	loadRaw: function(fn){
		try {
			return fs.readFileSync(path.resolve(__dirname, fn));
		} catch (e) {return null;}
	},
	save: function(fn,data){
		fs.writeFileSync(path.resolve(__dirname, fn),data);
	},
	saveRaw: function(fn,data){
		fs.writeFileSync(path.resolve(__dirname, fn),new Buffer(data));
	}
	};


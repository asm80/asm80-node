/*

Multitarget assembler (C) 2013 Martin Maly, http://www.maly.cz, http://www.webscript.cz

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

 Parser is based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

var ASM = require("./asm.js");
var Parser = require("./parser.js");
var Monolith = require("./monolith.js");
var path = require("path");
var fs = require("fs");
var LFS = require("./lfsnode.js");


var program = require('commander');

program.version('1.0.0')
	.usage('[options] <file>')
	.option('-o, --output <file>', 'Output file name')
	.option('-t, --type <type>', 'Output type [hex]')
	.option('-n, --nolist', 'Suppress listing')
	.option('-m, --machine <type>', 'Processor type (see below)')
	.on('--help', function(){
	  console.log('  Machine types:');
	  console.log('');
	  for (var i in Monolith) {
	  	console.log("   - "+i);
	  }
	  console.log('');
	})
	.parse(process.argv);


if (!program.args.length) {
	program.help();		
}

var asmType = function(fn) {
	var ext = path.extname(fn).toUpperCase();
	if (ext==='.A80') {return 'I8080';}
	if (ext==='.A68') {return 'M6800';}
	if (ext==='.A18') {return 'CDP1802';}
	if (ext==='.A09') {return 'M6809';}
	if (ext==='.A65') {return 'C6502';}
	if (ext==='.816') {return 'C65816';}
	if (ext==='.Z80') {return 'Z80';}

	return "unknown";
};

var fn = path.resolve(__dirname, program.args[program.args.length-1]);

var asmtype = (asmType(fn));

var data = LFS.load(program.args[program.args.length-1]);
//console.log(asmtype);

if (program.machine) {
	asmtype = program.machine.toUpperCase();
}

switch (asmtype) {
	case 'I8080':	vxx = ASM.compile(data, Monolith.I8080); break;
	case 'C6502':	vxx = ASM.compile(data, Monolith.C6502); break;
	case 'C65816':	vxx = ASM.compile(data, Monolith.C65816); break;
	case 'Z80':		vxx = ASM.compile(data, Monolith.Z80); break;
	case 'M6800':	vxx = ASM.compile(data, Monolith.M6800); break;
	case 'CDP1802':	vxx = ASM.compile(data, Monolith.CDP1802); break;
	case 'M6809':	vxx = ASM.compile(data, Monolith.M6809); break;
	default: console.log("Unrecognized ASM type");
	process.exit(-1);
}

if (vxx[0]) {
	//error
	console.log(vxx[0].msg+ "\n" + "Line: "+vxx[0].s.numline);
	process.exit(-1);
}

var npath = path.parse(fn);
npath.ext = ".hex";
delete(npath.base);
var vx = vxx[1];
var hex = ASM.hex(vx[0]);

if (program.output) {
	npath.base = program.output;
}

//console.log(npath,path.format(npath));

LFS.save(path.format(npath),hex);


if (!program.nolist) {
	var lpath = path.parse(path.format(npath));
	lpath.ext = ".lst";
	delete(lpath.base);
	var lst = ASM.lst(vx[0],vx[1]);
	LFS.save(path.format(lpath),lst);
}
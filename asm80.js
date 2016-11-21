#!/usr/bin/env node

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

/* eslint-disable no-console */
/*global process*/

var __cwd = process.cwd();

var ASM = require("./asm.js");
var Monolith = require("./monolith.js");
var path = require("path");
var LFS = require("./lfsnode.js");
var hextools = require("./hextools.js");



var program = require('commander');

program.version('1.0.0')
  .usage('[options] <file>')
  .option('-o, --output <file>', 'Output file name')
  .option('-t, --type <type>', 'Output type [default: hex] - hex, srec, com (for CP/M), sna, tap (for ZX Spectrum), prg (for C64)')
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

var fn = path.resolve(__cwd, program.args[program.args.length-1]);

var asmtype = (asmType(fn));

var data = LFS.load(program.args[program.args.length-1]);

if (program.machine) {
  asmtype = program.machine.toUpperCase();
}

var vxx = [null, null];

var mpath = path.parse(fn);
var root = mpath.dir;
//console.log(mpath);

ASM.fileGet(function(fn){
  var nfn = path.resolve(root,fn);
  //console.log("Include", path.resolve(root,fn));
  return LFS.load(nfn);
});

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
  console.log(vxx[0]);
  //+ "\n" + "Line: "+vxx[0].s.numline);
  process.exit(-1);
}

var otype = 'hex';
if (program.type) {
  switch (program.type.toUpperCase()) {
    case "SREC": otype="srec"; break;
    case "HEX": otype="hex"; break;
    case "PRG": otype="prg"; break;
    case "COM": otype="com"; break;
    case "SNA": otype="sna"; break;
    case "TAP": otype="tap"; break;
    default: console.log("Unknown output type"); process.exit(-1);
  }
}

var npath = path.parse(fn);
npath.ext = "."+otype;
delete(npath.base);
var vx = vxx[1];

var outdata;
if (otype == "srec") {
  outdata = ASM.srec(vx[0]);
} else {
  outdata = ASM.hex(vx[0]);
}
if (program.output) {
  npath.base = program.output;
}

if (otype == "prg") {
  if (asmtype!=="C6502") console.log("Warning: PRG is for Commodore C64, it should be compiled for 6502 CPU");
  if (!ASM.ENT) console.log("Please specify the entry point (use .ENT directive)");
  outdata = hextools.hex2prg(outdata,ASM.ENT);
}

if (otype == "com") {
  if (asmtype!=="I8080" && asmtype !== "Z80") console.log("Warning: COM is for CP/M, it should be compiled for 8080/Z80 CPU");
  outdata = hextools.hex2com(outdata,ASM.ENT);
}

if (otype == "sna") {
  if (asmtype !== "Z80") console.log("Warning: SNA is for ZX Spectrum, it should be compiled for Z80 CPU");
  outdata = hextools.makeSNA(vx[0],ASM.ENT);
}

if (otype == "tap") {
  if (asmtype !== "Z80") console.log("Warning: TAP is for ZX Spectrum, it should be compiled for Z80 CPU");
  outdata = hextools.makeTAP(vx[0],ASM.ENT);
}


//console.log(npath,path.format(npath));

LFS.save(path.format(npath),outdata);


if (!program.nolist) {
  var lpath = path.parse(path.format(npath));
  lpath.ext = ".lst";
  delete(lpath.base);
  var lst = ASM.lst(vx[0],vx[1]);
  LFS.save(path.format(lpath),lst);
}

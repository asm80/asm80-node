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

/* jshint browser:true, jquery:true */
/*global define, Uint8Array*/
/* eslint-disable no-empty */

var ASM = {};

(function(name, definition) {
    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') {define(definition);}
    else {this[name] = definition();}
}('ASM', function() {
  "use strict";
  var assembler = null;
  var fileGet = null;
  var includedFiles = {};
  var endian = false;
  var Parser = require("./parser.js").Parser;

  var norm = function(xs) {
    return xs.map(function(lx){
      var l = lx.line;
      l = l.replace("&lt;",'<');
      l = l.replace("&gt;",'>');
      while (l[l.length-1]===' ') {l = l.substr(0,l.length-1);}
      lx.line = l;
      if (l[0]!==' ') {return lx;}
      while (l[0]===' ') {l = l.substr(1);}
      lx.line = ' '+l;
      return lx;
    });
  };
  var nonempty = function(xs) {
    return xs.filter(function(lx){
      var l = lx.line;
      while (l[0]===' ') {l = l.substr(1);}
      return l.length?true:false;
    });
  };
  var emptymask = function(xs) {
    return xs.map(function(lx){
      var l = lx.line;
      var lx2 = {addr:0,line:";;;EMPTYLINE", numline:lx.numline};
      while (l[0]===' ') {l = l.substr(1);}
      return l.length?lx:lx2;
    });
  };
/*
  var toLines = function(s) {
    return norm(nonempty(s.split(/\n/)));
  };
*/
  var toInternal = function(xs) {
    var numLine = 1;
    return xs.map(function(line){
      return {
        "line":line,
        "numline": numLine++,
        'addr':null,
        'bytes':0
      };
    });
  };

  var trim = function(s) {
    return s.replace(/^\s+|\s+$/g, '');
  };

  var parseLine = function(s, macros, stopFlag, olds) {
    var t = s.line;
    var ll = t.match(/^\s*(\@{0,1}[a-zA-Z0-9-_]+):\s*(.*)/);
    if(ll) {
      s.label=ll[1].toUpperCase();
      t = ll[2];
    }
    //special opcode for EQU as "="
    var oo = t.match(/^\s*(\=)\s*(.*)/);
    if (oo) {
      s.opcode = oo[1].toUpperCase();
      t = oo[2];
    } else {
      oo = t.match(/^\s*([\.a-zA-Z0-9-_]+)\s*(.*)/);
      if (oo) {
        s.opcode = oo[1].toUpperCase();
        t = oo[2];
      }
    }
    if (t) {

      //semicolon fix
      while (t.match(/"(.*?);(.*?)"/g)) {
        t = t.replace(/"(.*?);(.*?)"/g,'"$1§$2"');
      }

      var pp = t.match(/^\s*([^;]*)(.*)/);
      if (pp && pp[1].length) {
        s.paramstring = pp[1];

        //sane strings
        var ppc = pp[1];
        while (ppc.match(/"(.*?),(.*?)"/g)) {
          ppc = ppc.replace(/"(.*?),(.*?)"/g,'"$1€$2"');
        }

        var n = ppc.match(/([0-9]+)\s*DUP\s*\((.*)\)/i);
        if (n) {
          var dup = parseInt(n[1]);
          var nln = '';
          for (var i = 0; i<dup; i++){
            nln+=n[2]+',';
          }
          ppc = nln.substring(0,nln.length-1);
          //console.log(ppc);
        }

        var px = ppc.split(/\s*,\s*/);
        s.params = px.map(function(ppc){return trim(ppc.replace(/€/g,",").replace(/§/g,";"));});


        t = pp[2].replace(/§/g,';');
      }
    }

    if (t) {
      var rr = t.match(/^\s*;*(.*)/);
      if (rr) {
        s.remark = rr[1];
        if (!s.remark) {s.remark = ' ';}
        t = '';
      }
    }
    s.notparsed = t;

    //pokus s asm

    if (s.opcode==='ORG') {
      s.opcode = '.ORG';
    }
    if (s.opcode===".ERROR") {
      throw {"msg":s.paramstring, "s":s};
    }
    if (s.opcode==='.EQU') {
      s.opcode = 'EQU';
    }
    if (s.opcode==='.ORG') {
      try {
//				s.addr = Parser.evaluate(s.paramstring);
        return s;
      } catch (e) { throw {"msg":e.message, "s":s}; }
    }

    if (s.opcode==='DEFB') {
      s.opcode = 'DB';
      return s;
    }
    if (s.opcode==='.DB') {
      s.opcode = 'DB';
      return s;
    }
    if (s.opcode==='.DW') {
      s.opcode = 'DW';
      return s;
    }
    if (s.opcode==='DEFW') {
      s.opcode = 'DW';
      return s;
    }
    if (s.opcode==='DEFS') {
      s.opcode = 'DS';
      return s;
    }
    if (s.opcode==='DEFM') {
      s.opcode = 'DS';
      return s;
    }

    if (s.opcode==='.ALIGN') {
      s.opcode = 'ALIGN';
      return s;
    }

    if (s.opcode==='EQU' ||
      s.opcode==='=' ||
      s.opcode==='IF' ||
      s.opcode==='IFN' ||
      s.opcode==='ENDIF' ||
      s.opcode==='.INCLUDE' ||
      s.opcode==='.INCBIN' ||
      s.opcode==='.MACRO' ||
      s.opcode==='.ENDM' ||
      s.opcode==='.BLOCK' ||
      s.opcode==='.ENDBLOCK' ||
      s.opcode==='.REPT' ||
      s.opcode==='.CPU' ||
      s.opcode==='.ENT' ||
      s.opcode==='.ENGINE' ||
      s.opcode==='.PRAGMA' ||
      s.opcode==='END' ||
      s.opcode==='.END' ||
      //6809 assembler ops
      s.opcode==='BSZ' ||
      s.opcode==='FCB' ||
      s.opcode==='FCC' ||
      s.opcode==='FDB' ||
      s.opcode==='FILL' ||
      s.opcode==='RMB' ||
      s.opcode==='ZMB' ||
      //65816
      s.opcode==='.M8' ||
      s.opcode==='.X8' ||
      s.opcode==='.M16' ||
      s.opcode==='.X16' ||

      //phase, dephase
      s.opcode==='.PHASE' ||
      s.opcode==='.DEPHASE' ||
      s.opcode==='ALIGN' ||
      s.opcode==='DB' ||
      s.opcode==='DS' ||
      s.opcode==='DW') {
      return s;
    }


    if (!s.opcode && s.label) {
      return s;
    }

    var ax;
    try {
      ax = assembler.parseOpcode(s);
    } catch (e) {
      throw {"msg":e, "s":s};

    }
    if (ax !== null) return ax;


    if (macros[s.opcode]) {
      s.macro = s.opcode;
      return s;
    }


    //label bez dvojtecky

    if (!s.label && !stopFlag) {
      var s2 = {line:s.line,numline:s.numline, addr:null,bytes:0};

      if (s.remark && !s.opcode) {return s;}
      if (!s.params) throw {"msg":"Unrecognized instruction "+s.opcode, "s":s};
      if (!s.opcode) throw {"msg":"Unrecognized instruction "+s.opcode, "s":s};
      s2.line = s.opcode + ': '+s.params.join();
      var sx = parseLine(s2, macros,true,s);
      if (!sx.opcode) throw {"msg":"Unrecognized instruction "+s.opcode, "s":s};
      return (sx);
    }
    if (stopFlag) throw {"msg":"Unrecognized instruction "+olds.opcode, "s":s};
    throw {"msg":"Unrecognized instruction "+s.opcode, "s":s};

  };

  var prepro = function (V) {
    var op,ln, px, params=null;

    var macros = {};
    var macroDefine = null;
    var reptCount = null;
    var out = [];
    //var outi = 0;
    for (var i=0, j=V.length;i<j;i++) {
      op = V[i].line;
      ln = op.match(/\s*(\.[^\s]+)(.*)/);

      if (!ln) {
        if (macroDefine) {
          macros[macroDefine].push(V[i]);
          continue;
        } else {
          out.push(V[i]);
        }
        continue;
        }
      var opcode = ln[1].toUpperCase();
      var pp = ln[2].match(/^\s*([^;]*)(.*)/);
      if (pp && pp[1].length) {
        //paramstring = pp[1];
        px = pp[1].split(/\s*,\s*/);
        params = px.map(trim);
      } else {params = null;}


      if (opcode === '.INCLUDE') {
        if (!params[0]) throw {"msg":"No file name given at line "+op.numline,"s":op};
        if (includedFiles[params[0]]) throw {"msg":"File "+params[0]+" is already included elsewhere - maybe recursion at line "+op.numline,"s":op};
        //console.log("Include "+params[0]);
        var nf = fileGet(params[0]);
        //console.log(nf);
        var ni = toInternal(nf.split(/\n/));
        ni = nonempty(ni);
        ni = norm(ni);
        var preni = prepro(ni);
        for (var k = 0; k<preni[0].length;k++) {
          preni[0][k].includedFile = params[0];
          out.push(preni[0][k]);
        }
        for (k in preni[1]) {
          macros[k] = preni[1][k];
        }
        //console.log(preni);
        includedFiles[params[0]] = nf;
        continue;
      }


      if (opcode === '.ENDM') {
        if (!macroDefine) {throw {"msg":"ENDM without MACRO at line "+V[i].numline,"s":V[i]};}
        if (reptCount) {
          //je to REPT makro, co ted?
          out.push({numline:V[i].numline, line:";rept unroll", addr:null,bytes:0, remark:"REPT unroll"});
          for (var ii=0;ii<reptCount;ii++) {

            for (var jj=0;jj<macros[macroDefine].length;jj++){
              var macline = macros[macroDefine][jj].line;
              out.push({numline:V[ii].numline, line:macline, addr:null,bytes:0});
            }
          }

        }
        macroDefine = null;
        reptCount = null;
        continue;
      }


      if (opcode === '.MACRO') {
        if (!params[0]) throw {"msg":"Bad macro name at line "+V[i].numline,"s":V[i]};
        macroDefine = params[0].toUpperCase();
        if (macros[macroDefine]) throw {"msg":"Macro redefinition at line "+V[i].numline,"s":V[i]};
        macros[macroDefine] = [];
        continue;
      }
      if (opcode === '.REPT') {
        if (!params[0]) throw {"msg":"No repeat count given","s":V[i]};
        reptCount = Parser.evaluate(params[0]);
        if (!reptCount) throw {"msg":"Bad repeat count given","s":V[i]};
        macroDefine = "*REPT"+V[i].numline;
        if (macros[macroDefine]) throw {"msg":"Macro redefinition at line "+V[i].numline,"s":V[i]};
        macros[macroDefine] = [];
        continue;
      }

      out.push(V[i]);
    }
    if (macroDefine) {
      throw {"msg":"MACRO "+macroDefine+" has no appropriate ENDM","s":V[i]};
    }

    return [out,macros];
  };

  var macroParams = function(d, params) {
    var out = {line:d.line, addr:d.addr, macro:d.macro, numline:d.numline};
    for (var i=0;i<params.length;i++) {
      out.line = out.line.replace("%%"+(i+1),params[i]);
    }
    return out;
  };
  var unroll = function(V, macros) {
    var out = [];
    for(var i=0;i<V.length;i++) {
      var s = V[i];
      if (!s.macro) {out.push(s);continue;}
      var m = macros[s.macro];
      for (var j=0;j<m.length;j++) {
        var ng = parseLine(macroParams(m[j],s.params), macros);
        if (s.label) ng.label = s.label;
        s.label='';
        ng.remark = s.remark;
        ng.macro = s.macro;
        s.macro = null;
        s.remark='';
        out.push(ng);
      }
    }
    return out;
  };

  var parse = function(s, asm) {
    assembler = asm;
    if (asm.endian) endian = asm.endian;
    includedFiles = {};
    var i = toInternal(s.split(/\n/));
    i = nonempty(i);
    i = norm(i);
    var prei = prepro(i);
    i = prei[0].map(function(line){return parseLine(line, prei[1]);});
    i = unroll(i, prei[1]);
    return i;
  };

  var beautify = function(s,asm) {
    assembler = asm;
    var i = toInternal(s.split(/\n/));
    i = emptymask(i);
    i = nonempty(i);
    i = norm(i);
    var prei = prepro(i);
    i = i.map(function(line){return parseLine(line,prei[1]);});
    var out='';
    var op,ln;
    for (var q=0;q<i.length;q++) {
      op = i[q];
      ln = '';
      if (op.remark==='EMPTYLINE') {
        out += "\n"; continue;
      }
      if (op.label) {

        ln += op.label;
        if (op.opcode!=='EQU' && op.opcode!=='=') ln += ':';
        ln+=' ';
      }
      while (ln.length<12) {ln+= ' ';}
      if (op.opcode) {ln += op.opcode+' ';}
      while (ln.length<20) {ln+= ' ';}
      if (op.params) {ln += op.params+' ';}
      if (op.remark) {ln += ';'+op.remark;}
      out += ln+"\n";

    }
    return out;
  };

  var pass1 = function(V, vxs) {
    var PC = 0;
    var vars = {};
    if (vxs) vars=vxs;
    var op = null;
    var m,l, iq;
    var ifskip = 0;
    var cond;
    var blocks = [];
    var phase = 0;
    var bytes;
    for (var i=0, j=V.length;i<j;i++) {

      op = V[i];
      op.pass = 1;
      op.addr = PC;
      vars._PC = PC;
      if (phase!==0) {
        op.phase = phase;
      }

      if (op.opcode === "ENDIF") {
        ifskip = 0;
        continue;
      }

      if (ifskip) {continue;}

      if (op.opcode === "IF") {
        try {
          cond = Parser.evaluate(op.params[0], vars);
          if (!cond) ifskip = 1;
        } catch (e) {ifskip = 1;}
        continue;
      }
      if (op.opcode === "IFN") {
        try {
          cond = Parser.evaluate(op.params[0], vars);
          if (cond) ifskip = 1;
        } catch (e) { }
        continue;
      }

      if (op.opcode==='.BLOCK') {
        blocks.push(op.numline);
        //console.log("bl!", blocks);
        var prefix = blocks.join("/");
        //vars['__blocks'] = JSON.stringify(blocks);
        vars['__'+prefix] = [];

        continue;
      }
      if (op.opcode==='.ENDBLOCK') {
        var redef  = vars['__'+blocks.join("/")];
        //console.log(redef);
        for (var nn = 0;nn<redef.length;nn++) {
          vars[redef[nn]] = vars[blocks.join("/")+"/"+redef[nn]];
          vars[blocks.join("/")+"/"+redef[nn]] = null;
        }
        blocks.pop();
        vars['__blocks'] = JSON.stringify(blocks);

        continue;
      }


      if (op.label) {
        var varname = op.label;
        var beGlobal = false;
        if (varname[0]==='@') {
          beGlobal = true;
          varname = varname.substr(1);
          op.label = varname;
        }
        if (blocks.length>0) {
          varname = blocks.join("/")+"/"+varname;
          vars['__'+blocks.join("/")].push(op.label);

        }
        //console.log(op.label,beGlobal,vars[op.label]!==undefined, vars);
        if (!vxs) {
          if (vars[varname+'$'] || (beGlobal && vars[op.label]!==undefined)) {
            throw {"msg":"Redefine label "+op.label+" at line "+op.numline, "s":op};
          }
        }
        if (vars[op.label]) {

          vars[varname] = vars[op.label];
        } else {
          if (beGlobal) {
            vars[varname] = PC;
          }
        }
        vars[varname+'$'] = PC;
        vars[op.label] = PC;
      }

      try {

      if (op.opcode === ".ORG") {
        PC = Parser.evaluate(op.params[0], vars);
        op.addr = PC;
        continue;
      }
      if (op.opcode === ".PHASE") {
        var newphase = Parser.evaluate(op.params[0], vars);
        op.addr = PC;
        phase = newphase - PC;
        PC = newphase;
        continue;
      }
      if (op.opcode === ".DEPHASE") {
        op.addr = PC;
        PC = PC - phase;
        phase = 0;
        continue;
      }
      if (op.opcode === "EQU") {
        //TADY JESTE NEMUSI BYT OK!!!
        try {
          vars[op.label] = Parser.evaluate(op.params[0], vars);
        } catch(e) {
          vars[op.label] = null;
          //console.log('Unsatisfied '+op.label);
        }
        continue;
      }
      if (op.opcode === "=") {
        vars[op.label] = Parser.evaluate(op.params[0], vars);
        continue;
      }
      } catch (e) {throw{"msg":e.message, "s":op};}

      if (op.opcode === "DB" || op.opcode === "FCB") {
        op.bytes = 0;
        for (l = 0;l<op.params.length;l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof(m)==='number') {op.bytes++; continue;}
            if (typeof(m)==='string') {op.bytes+=m.length; continue;}
          } catch(e) {op.bytes++;}
        }
      }
      if (op.opcode === "DS" || op.opcode === "RMB") {
        //op.bytes = Parser.evaluate(op.params[0]);
        bytes = Parser.evaluate(op.params[0], vars);
        if (op.params.length===2) {
          //DB alias
          m = Parser.evaluate(op.params[1], vars);
          if (typeof m === 'string') m = m.charCodeAt(0);
          op.bytes = bytes;
          op.lens = [];
          for (iq=0;iq<bytes;iq++) {
            op.lens[iq] = m;
          }
          //console.log(op.lens);
        }
          PC = PC + bytes;

        continue;
      }
      if (op.opcode === "ALIGN") {
        //op.bytes = Parser.evaluate(op.params[0]);
        var align = Parser.evaluate(op.params[0], vars);

        PC = PC + ((PC%align>0)?(align - PC%align):0);

        continue;
      }
      if (op.opcode === "FILL") {
        //op.bytes = Parser.evaluate(op.params[0]);
        bytes = Parser.evaluate(op.params[1], vars);
          //DB alias
        m = Parser.evaluate(op.params[0], vars);
        if (typeof m === 'string') m = m.charCodeAt(0);
        op.bytes = bytes;
        op.lens = [];
        for (iq=0;iq<bytes;iq++) {
          op.lens[iq] = m;
        }
          //console.log(op.lens);
          PC = PC + bytes;

        continue;
      }
      if (op.opcode === "BSZ" || op.opcode === "ZMB") {
        //op.bytes = Parser.evaluate(op.params[0]);
        bytes = Parser.evaluate(op.params[0], vars);
        op.bytes = bytes;
        op.lens = [];
        for (iq=0;iq<bytes;iq++) {
          op.lens[iq] = 0;
        }
        PC = PC + bytes;

        continue;
      }
      if (op.opcode === "DW" || op.opcode === "FDB") {
        op.bytes = 0;
        for (l = 0;l<op.params.length;l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof(m)==='number') {op.bytes+=2; continue;}
          } catch(e) {op.bytes+=2;}
        }
      }


      if (op.opcode === ".INCBIN") {
        if (!op.params[0]) throw {"msg":"No file name given at line "+op.numline,"s":op};
        //console.log("Include "+params[0]);
        var nf = fileGet(op.params[0],true);
        if (!nf) throw {"msg":"Cannot find file "+op.params[0]+" for incbin", "s":op};

        var nb = new Uint8Array(nf);
        //console.log(nb);
        op.bytes = 0;
        op.lens = [];
        for (iq=0;iq<nb.length;iq++) {
          var cd = nb[iq];
          if (cd>255) {
            op.lens[op.bytes++] = cd>>8;
          }
          op.lens[op.bytes++] = cd % 256;
        }
          //console.log(op.lens);
          PC = PC + op.bytes;

        continue;
      }

      //65816
      if (op.opcode === ".M16") {
        vars.__AX = 16;
        continue;
      }
      if (op.opcode === ".M8") {
        vars.__AX = 8;
        continue;
      }
      if (op.opcode === ".X16") {
        vars.__MX = 16;
        continue;
      }
      if (op.opcode === ".X8") {
        vars.__MX = 8;
        continue;
      }


      //je to instrukce? Jde optimalizovat?
      var opa = assembler.parseOpcode(V[i], vars);
      if (opa) {
        //console.log(op,opa);
        op = opa;
      }


      PC += op.bytes;
    }



    return [V, vars];
  };

  var toHexN = function(n,d) {
    var s = n.toString(16);
    while (s.length <d) {s = '0'+s;}
    return s.toUpperCase();
  };

  var toHex2 = function(n) {return toHexN(n & 0xff,2);};
  var toHex4 = function(n) {return toHexN(n,4);};

  var charVar8 = function(dta) {
    if (typeof(dta)=='string') {
      return dta.charCodeAt(0) & 0xff;
    } else {
      return dta & 0xff;
    }
  };
  /*
  var charVar16 = function(dta) {
    if (typeof(dta)=='string') {
      return dta.charCodeAt(0) & 0xff;
    } else {
      return dta & 0xff;
    }
  };
*/
  var pass2 = function(vx) {
    var V = vx[0];
    var vars = vx[1];
//		console.log(vars);
    var op = null, dta=null, m, bts, l;
    var blocks = [];
    var redef, nn;
    for (var i=0, j=V.length;i<j;i++) {
      try {
      op = V[i];
      op.pass = 2;
      vars._PC = op.addr;
      //console.log(op);

      if (op.opcode === ".BLOCK") {
        blocks.push(op.numline);
        redef  = vars['__'+blocks.join("/")];
        for (nn = 0;nn<redef.length;nn++) {
          vars[blocks.join("/")+"/"+redef[nn]] = vars[redef[nn]];
          vars[redef[nn]] = vars[blocks.join("/")+"/"+redef[nn]+"$"];
        }
        //console.log(vars);
        continue;
      }
      if (op.opcode === ".ENDBLOCK") {
        redef  = vars['__'+blocks.join("/")];
        for (nn = 0;nn<redef.length;nn++) {
          vars[redef[nn]] = vars[blocks.join("/")+"/"+redef[nn]];
          if (vars[redef[nn]]===undefined) delete(vars[redef[nn]]);
          vars[blocks.join("/")+"/"+redef[nn]] = null;
        }
        blocks.pop();
        //console.log(vars);
        continue;
      }

      if (op.opcode === ".ENT") {
        ASM.ENT=Parser.evaluate(op.params[0], vars);
        continue;
      }
      if (op.opcode === ".ENGINE") {
        ASM.ENGINE=op.params[0];
        continue;
      }
      if (op.opcode === ".PRAGMA") {
        ASM.PRAGMAS=ASM.PRAGMAS || [];
        ASM.PRAGMAS.push(op.params[0].toUpperCase());
        continue;
      }
      if (op.opcode === "EQU") {
        //console.log(op.label);
        vars[op.label] = Parser.evaluate(op.params[0], vars);
        continue;
      }
      if (op.opcode === "DB" || op.opcode === "FCB") {
        bts = 0;
        op.lens=[];
        for (l = 0;l<op.params.length;l++) {
          m = Parser.evaluate(op.params[l],vars);
          if (typeof(m)==='number') {op.lens[bts++] = Math.floor(m%256); continue;}
          if (typeof(m)==='string') {for (var mm = 0;mm<m.length;mm++) {op.lens[bts++] = m.charCodeAt(mm);} continue;}
        }
        continue;
      }
      if (op.opcode === "DW" || op.opcode === "FDB") {
        bts = 0;
        op.lens=[];
        for (l = 0;l<op.params.length;l++) {
          m = Parser.evaluate(op.params[l],vars);
          if (typeof(m)==='number') {
            if (endian)
              {op.lens[bts++] = Math.floor(m/256);op.lens[bts++] = Math.floor(m%256);}
            else {op.lens[bts++] = Math.floor(m%256);op.lens[bts++] = Math.floor(m/256);}
            continue;}
        }
        continue;
      }
/*
      if (op.opcode === "DS") {
        console.log(op);
      }
*/
      if (op.lens && op.lens[1] && typeof(op.lens[1]) === 'function') {
        if (op.lens[2]==="addr24") {
          //3 bytes - 65816 modes
          dta = op.lens[1](vars);
            if (endian) {
              op.lens[3] = Math.floor(dta%256);
              op.lens[2] = Math.floor((dta>>8)%256);
              op.lens[1] = Math.floor((dta>>16)&0xff);
            } else {
              op.lens[1] = Math.floor(dta%256);
              op.lens[2] = Math.floor((dta>>8)%256);
              op.lens[3] = Math.floor((dta>>16)&0xff);
            }
        } else if (op.lens[2]===null) {
          //2 bytes
          dta = op.lens[1](vars);
          if (typeof(dta)=='string') {
            if (endian) {
              op.lens[1] = dta.charCodeAt(0) & 0xff;
              op.lens[2] = dta.charCodeAt(1) & 0xff;
            } else {
              op.lens[2] = dta.charCodeAt(0) & 0xff;
              op.lens[1] = dta.charCodeAt(1) & 0xff;
            }
          } else {
            if (endian) {
              op.lens[2] = Math.floor(dta%256);
              op.lens[1] = Math.floor(dta/256);
            } else {
              op.lens[1] = Math.floor(dta%256);
              op.lens[2] = Math.floor(dta/256);
            }
          }
        } else {
          dta = op.lens[1](vars);
          op.lens[1] = charVar8(dta);
        }
      }
      if (op.lens && op.lens.length>2 && typeof(op.lens[2])=='function') {
//				console.log("OPLENS3",op.lens[3], op.lens[2]);
        dta = op.lens[2](vars);
        if (op.lens[3]===null) {
          dta = op.lens[2](vars);
          if (typeof(dta)=='string') {
            if (endian) {
              op.lens[2] = dta.charCodeAt(0) & 0xff;
              op.lens[3] = dta.charCodeAt(1) & 0xff;
            } else {
              op.lens[3] = dta.charCodeAt(0) & 0xff;
              op.lens[2] = dta.charCodeAt(1) & 0xff;
            }
          } else {
            if (endian) {
              op.lens[3] = dta & 0xff;
              op.lens[2] = dta>>8;
            } else {
              op.lens[2] = dta & 0xff;
              op.lens[3] = dta>>8;
            }
          }
        } else {
          op.lens[2] = charVar8(dta);
        }
      }

      if (op.lens && op.lens.length>3 && typeof(op.lens[3])=='function') {
        dta = op.lens[3](vars);
        if (op.lens[4]===null) {
          dta = op.lens[3](vars);
          if (typeof(dta)=='string') {
            if (endian) {
              op.lens[3] = dta.charCodeAt(0) & 0xff;
              op.lens[4] = dta.charCodeAt(1) & 0xff;
            } else {
              op.lens[4] = dta.charCodeAt(0) & 0xff;
              op.lens[3] = dta.charCodeAt(1) & 0xff;
            }
          } else {
            if (endian) {
              op.lens[4] = dta & 0xff;
              op.lens[3] = dta>>8;
            } else {
              op.lens[3] = dta & 0xff;
              op.lens[4] = dta>>8;
            }
          }
        } else {
          op.lens[3] = charVar8(dta);
        }

//				op.lens[3] = charVar8(op.lens[3](vars)) & 0xff;
      }

      if (op.lens && op.lens.length>1){
        if (typeof(op.lens[1])=='string') {
          op.lens[1] = op.lens[1].charCodeAt(0);
        }
        if (isNaN(op.lens[1])) {
          throw {message:"param out of bounds, NaN"};
        }
        if (op.lens[1]>255 || op.lens[1]<-128) {
          throw {message:"param out of bounds - "+op.lens[1]};
        }
        if (op.lens[1]<0) {op.lens[1]=256+op.lens[1];}
      }

    } catch (e) {throw{"msg":e.message, "s":op, "e":e};}

    }

    return [V, vars];

  };

  var lst = function(V,vars, raw, compact) {
    var ln;
    var op;
    var out='';
    if (compact===undefined) {compact = false;}
    for (var i=0, j=V.length;i<j;i++) {
      op = V[i];
      ln = '';
      if (op.macro && !raw) {ln += '        **MACRO UNROLL - '+op.macro+'\n';}
      if (op.addr!==undefined) {ln += toHex4(op.addr);
        if (op.phase) {ln += " @"+toHex4(op.addr-op.phase);}
        ln += (compact?" ":'   ');
      }
      if (op.lens) {
        for(var n = 0;n<op.lens.length;n++) {
          ln += toHex2(op.lens[n])+' ';
        }
      }

      if (!compact) while (ln.length<20) {ln+= ' ';}
      if (compact) while (ln.length<15) {ln+= ' ';}
      if (op.label) {ln += op.label+':   ';}
      if (!compact) while (ln.length<30) {ln+= ' ';}
      if (compact) while (ln.length<22) {ln+= ' ';}
      if (op.opcode) {ln += op.opcode+(compact?" ":'   ');}
      if (op.params) {ln += op.params+(compact?" ":'   ');}
      if (op.remark) {ln += ';'+op.remark;}
      out += ln+"\n";
    }
    if (raw) return out;
    out+="\n\n";
    for (var k in vars) {
      if (vars[k]===null) continue;
      if (k[0]==='_' && k[1]==='_') continue;
      if (k[k.length-1]==='$') continue;
      ln = '';
      ln += k;
      while (ln.length<12) {ln+= ' ';}
      ln += toHex4(vars[k]);
      out += ln+"\n";
    }

    return out;
  };

  var html = function(V,vars, raw, compact) {
    var parfix = function(par) {
      par+='';
      for (var k in vars) {
        if (vars[k]===null) continue;
        if (k[0]==='_' && k[1]==='_') continue;
        if (k[k.length-1]==='$') continue;
        var re = new RegExp(k,"i");
        if (par.match(re)) {
          return '<a href="#LBL'+k+'">'+par+'</a>';
        }
      }
      return par;
    };
    var ln;
    var op;
    var out='<html><head><meta charset=utf-8><body><table>';
    if (compact===undefined) {compact = false;}
    for (var i=0, j=V.length;i<j;i++) {
      op = V[i];
      ln = '<tr id="ln'+op.numline+'">';
      if (op.macro && !raw) {ln += '        **MACRO UNROLL - '+op.macro+'\n';}
      if (op.addr!==undefined) {ln += '<td><a name="ADDR'+toHex4(op.addr)+'">'+toHex4(op.addr)+'</a>';
        if (op.phase) {ln += "</td><td>"+toHex4(op.addr-op.phase);} else ln+='</td><td>';
        ln += '</td>';
      }  else ln+="<td></td><td></td>";
      if (op.lens) {
        ln+='<td>';
        for(var n = 0;n<op.lens.length;n++) {
          ln += toHex2(op.lens[n])+' ';
        }
        ln+='</td>';
      } else ln+="<td></td>";

      if (op.label) {ln += '<td><a name="LBL'+op.label+'">'+op.label+'</a></td>';} else ln+="<td></td>";
      if (op.opcode) {ln += '<td>'+op.opcode+'</td>';} else ln+="<td></td>";
      if (op.params) {ln += '<td>'+op.params.map(parfix)+'</td>';} else ln+="<td></td>";
      if (op.remark) {ln += '<td>'+';'+op.remark+'</td>';} else ln+="<td></td>";
      out += ln+"</tr>\n";
    }
    out+="</table>";
    return out;
/*
    if (raw) return out;
    out+="\n\n";
    for (var k in vars) {
      if (vars[k]===null) continue;
      if (k[0]=='_' && k[1]=='_') continue;
      if (k[k.length-1]==='$') continue;
      ln = '';
      ln += k;
      while (ln.length<12) {ln+= ' ';}
      ln += toHex4(vars[k]);
      out += ln+"\n";
    }

    return out;
*/
  };


  var linemap = function(V) {
    var op;
    var out=[];
    for (var i=0, j=V.length;i<j;i++) {
      op = V[i];

      if (op.lens) {
        for(var n = 0;n<op.lens.length;n++) {
          out[op.addr+n] = i+1 /*op.numline*/;
        }
      }
    }
    return out;
  };


  var hexLine = function(addr, buffer) {
    var s = ':';
    var len = buffer.length;
    var checksum = 0;
    s += toHex2(len);
    s += toHex4(addr);
    s += '00';
    checksum = len + Math.floor(addr / 256)+ Math.floor(addr % 256);
    for (var i=0;i<buffer.length;i++) {
      s += toHex2(buffer[i]);
      checksum += buffer[i];
    }
    s += toHex2(256-(checksum%256));
    return s;
  };

  var makeHex = function(addr,dta, linelen) {
    var inter = 0;
    var buffer = [];
    var ilen = 16;
    if (linelen>1) ilen=linelen;
    var out = '';
    for (var i=0;i<dta.length;i++) {
      buffer.push(dta[i]);
      if (++inter === ilen) {
        //flush
        out += hexLine(addr,buffer) + "\n";
        buffer = [];
        inter = 0;
        addr += ilen;
      }
    }
    if (buffer.length) {
      out += hexLine(addr,buffer) + "\n";
    }


    return out;
  };

  var ihex = function(V) {
    var op;
    var addr = null;
    var len = 0;
    var dta = [];
    var out = '';
    var ilen=16;
    for (var i=0, j=V.length;i<j;i++) {
      op = V[i];
      if (op.opcode==='.PRAGMA') {
        //hex len?
        if(op.params.length===2 && op.params[0].toUpperCase()==='HEXLEN') {
          ilen = parseInt(op.params[1]);
          if (ilen<1 || ilen>64) ilen=16;
        }
      }
      var opaddr = op.addr;
      if (op.phase) opaddr -= op.phase;
      if (opaddr!==undefined && len === 0) {
        addr = opaddr;
      }
      if (opaddr !== (addr + len)) {
        if (len) {
          //flush
          out+=makeHex(addr,dta,ilen);
        }
        addr = opaddr;
        len = 0;
        dta = [];
      }
      if (op.lens) {
        for (var n = 0; n<op.lens.length;n++) {
          dta.push(op.lens[n]);
        }
        len += op.lens.length;
        continue;
      }
    }
    if (dta.length) {out +=makeHex(addr,dta,ilen);}
    out += ':00000001FF';
    return out;
  };

//===s records

var srecLine = function(addr, buffer) {
  var s = 'S1';
  var len = buffer.length;
  var checksum = 0;
  s += toHex2(len+3);
  s += toHex4(addr);
  //s += '00';
  checksum = len +3+ Math.floor(addr / 256)+ Math.floor(addr % 256);
  for (var i=0;i<buffer.length;i++) {
    s += toHex2(buffer[i]);
    checksum += buffer[i];
  }
  s += toHex2(256-(checksum%256));
  return s;
};

var makeSrec = function(addr,dta) {
  var inter = 0;
  var buffer = [];
  var ilen = 16;
  var out = '';
  for (var i=0;i<dta.length;i++) {
    buffer.push(dta[i]);
    if (++inter === ilen) {
      //flush
      out += srecLine(addr,buffer) + "\n";
      buffer = [];
      inter = 0;
      addr += ilen;
    }
  }
  if (buffer.length) {
    out += srecLine(addr,buffer) + "\n";
  }


  return out;
};

var isrec = function(V) {
  var op;
  var addr = null;
  var len = 0;
  var dta = [];
  var out = '';
  for (var i=0, j=V.length;i<j;i++) {
    op = V[i];
    var opaddr = op.addr;
    if (op.phase) opaddr -= op.phase;
    if (opaddr!==undefined && len === 0) {
      addr = opaddr;
    }
    if (opaddr !== (addr + len)) {
      if (len) {
        //flush
        out+=makeSrec(addr,dta);
      }
      addr = opaddr;
      len = 0;
      dta = [];
    }
    if (op.lens) {
      for (var n = 0; n<op.lens.length;n++) {
        dta.push(op.lens[n]);
      }
      len += op.lens.length;
      continue;
    }
  }
  if (dta.length) {out +=makeSrec(addr,dta);}
  var ent = ASM.ENT || 0;
  var checksum = 3 + Math.floor(ent / 256)+ Math.floor(ent % 256);
  out += 'S903'+toHex4(ent)+toHex2(255-(checksum%256));
  return out;
};


  var iBuff = function(V){
    var buff = new Uint8Array(65536);
    var op, addr;
    for (var i=0, j=V.length;i<j;i++) {
      op = V[i];
      addr = op.addr;
      if (op.lens) {
        for (var n = 0; n<op.lens.length;n++) {
          buff[addr++] = op.lens[n];
        }
      }
    }
    return buff;
  };


  ASM = {
    'parse': parse,
    'pass1': pass1,
    'pass2': pass2,
    'parseLine': parseLine,
    'ENT': null,

    'compile': function(src, asmx) {
      try {
        ASM.ENT=null;
        ASM.ENGINE=null;
        ASM.PRAGMAS=[];
        var V = ASM.parse(src,asmx);

        var vx = ASM.pass1(V);
        vx = ASM.pass1(vx[0],vx[1]);
        vx = ASM.pass1(vx[0],vx[1]);
        vx = ASM.pass1(vx[0],vx[1]);
        vx = ASM.pass1(vx[0],vx[1]);
        vx = ASM.pass1(vx[0],vx[1]);
        vx = ASM.pass1(vx[0],vx[1]);

        vx = ASM.pass2(vx);

        return [null,vx];
      } catch (e) {
        return [e,null];
      }
    },
    'compileAsync': function(src, asmx, cb) {
      try {
        var V = ASM.parse(src,asmx);

        var vx = ASM.pass1(V);
        vx = ASM.pass2(vx);

        cb(null,vx);
      } catch (e) {
        cb(e,null);
      }
    },

    'lst': lst,
    'html': html,
    'hex': ihex,
    'srec': isrec,
    'linemap': linemap,
    'beautify':beautify,
    'buff': iBuff,
    'fileGet': function(cb){fileGet = cb;}
  };

  return ASM;
}));

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
  var Parser = require("./parser.js").Parser;
!function(e,n){"undefined"!=typeof module?(module.exports=n(),ASM=module.exports):"function"==typeof define&&"object"==typeof define.amd?define(n):this.ASM=n()}(0,function(){"use strict";var e=null,n=null,o={},r=!1,a=function(e){return e.map(function(e){var n=e.line;for(n=(n=n.replace("&lt;","<")).replace("&gt;",">");" "==n[n.length-1];)n=n.substr(0,n.length-1);if(e.line=n," "!=n[0])return e;for(;" "==n[0];)n=n.substr(1);return e.line=" "+n,e})},t=function(e){return e.filter(function(e){for(var n=e.line;" "==n[0];)n=n.substr(1);return!!n.length})},l=function(e){return e.map(function(e){for(var n=e.line,o={addr:0,line:";;;EMPTYLINE",numline:e.numline};" "==n[0];)n=n.substr(1);return n.length?e:o})},s=function(e){var n=1;return e.map(function(e){return{line:e,numline:n++,addr:null,bytes:0}})},i=function(e){return e.replace(/^\s+|\s+$/g,"")},p=function(n,o,r,a){var t=n.line,l=t.match(/^\s*(\@{0,1}[a-zA-Z0-9-_]+):\s*(.*)/);l&&(n.label=l[1].toUpperCase(),t=l[2]);var s=t.match(/^\s*(\=)\s*(.*)/);if(s?(n.opcode=s[1].toUpperCase(),t=s[2]):(s=t.match(/^\s*([\.a-zA-Z0-9-_]+)\s*(.*)/))&&(n.opcode=s[1].toUpperCase(),t=s[2]),t){for(;t.match(/"(.*?);(.*?)"/g);)t=t.replace(/"(.*?);(.*?)"/g,'"$1§$2"');var c=t.match(/^\s*([^;]*)(.*)/);if(c&&c[1].length){n.paramstring=c[1];for(var f=c[1];f.match(/"(.*?),(.*?)"/g);)f=f.replace(/"(.*?),(.*?)"/g,'"$1€$2"');var d=f.match(/([0-9]+)\s*DUP\s*\((.*)\)/i);if(d){for(var u=parseInt(d[1]),h="",m=0;m<u;m++)h+=d[2]+",";f=h.substring(0,h.length-1)}var g=f.split(/\s*,\s*/);n.params=g.map(function(e){return i(e.replace(/€/g,",").replace(/§/g,";"))}),t=c[2].replace(/§/g,";")}}if(t){var v=t.match(/^\s*;*(.*)/);v&&(n.remark=v[1],n.remark||(n.remark=" "),t="")}if(n.notparsed=t,"ORG"===n.opcode&&(n.opcode=".ORG"),".ERROR"===n.opcode)throw{msg:n.paramstring,s:n};if(".EQU"===n.opcode&&(n.opcode="EQU"),".ORG"===n.opcode)try{return n}catch(e){throw{msg:e.message,s:n}}if("DEFB"===n.opcode)return n.opcode="DB",n;if(".DB"===n.opcode)return n.opcode="DB",n;if(".DW"===n.opcode)return n.opcode="DW",n;if("DEFW"===n.opcode)return n.opcode="DW",n;if("DEFS"===n.opcode)return n.opcode="DS",n;if("DEFM"===n.opcode)return n.opcode="DS",n;if(".ALIGN"===n.opcode)return n.opcode="ALIGN",n;if(".IF"===n.opcode)return n.opcode="IF",n;if(".ELSE"===n.opcode)return n.opcode="ELSE",n;if(".ENDIF"===n.opcode)return n.opcode="ENDIF",n;if("EQU"===n.opcode||"="===n.opcode||"IF"===n.opcode||"IFN"===n.opcode||"ELSE"===n.opcode||"ENDIF"===n.opcode||".INCLUDE"===n.opcode||".INCBIN"===n.opcode||".MACRO"===n.opcode||".ENDM"===n.opcode||".BLOCK"===n.opcode||".ENDBLOCK"===n.opcode||".REPT"===n.opcode||".CPU"===n.opcode||".ENT"===n.opcode||".BINFROM"===n.opcode||".BINTO"===n.opcode||".ENGINE"===n.opcode||".PRAGMA"===n.opcode||"END"===n.opcode||".END"===n.opcode||"BSZ"===n.opcode||"FCB"===n.opcode||"FCC"===n.opcode||"FDB"===n.opcode||"FILL"===n.opcode||"RMB"===n.opcode||"ZMB"===n.opcode||".M8"===n.opcode||".X8"===n.opcode||".M16"===n.opcode||".X16"===n.opcode||".PHASE"===n.opcode||".DEPHASE"===n.opcode||"ALIGN"===n.opcode||".CSTR"===n.opcode||".ISTR"===n.opcode||".PSTR"===n.opcode||".CSEG"===n.opcode||".DSEG"===n.opcode||".ESEG"===n.opcode||".BSSEG"===n.opcode||"DB"===n.opcode||"DS"===n.opcode||"DW"===n.opcode)return n;if(!n.opcode&&n.label)return n;try{var E=e.parseOpcode(n)}catch(e){throw{msg:e,s:n}}if(null!==E)return E;if(o[n.opcode])return n.macro=n.opcode,n;if(!n.label&&!r){var M={line:n.line,numline:n.numline,addr:null,bytes:0};if(n.remark&&!n.opcode)return n;if(!n.params)throw{msg:"Unrecognized instruction "+n.opcode,s:n};if(!n.opcode)throw{msg:"Unrecognized instruction "+n.opcode,s:n};M.line=n.opcode+": "+n.params.join();var S=p(M,o,!0,n);if(!S.opcode)throw{msg:"Unrecognized instruction "+n.opcode,s:n};return S}if(r)throw{msg:"Unrecognized instruction "+a.opcode,s:n};throw{msg:"Unrecognized instruction "+n.opcode,s:n}},c=function(e){for(var r,l,p=null,f={},d=null,u=null,h=[],m=0,g=e.length;m<g;m++)if(r=e[m].line,l=r.match(/\s*(\.[^\s]+)(.*)/)){var v=l[1].toUpperCase(),E=l[2].match(/^\s*([^;]*)(.*)/);if(E&&E[1].length?(E[1],p=E[1].split(/\s*,\s*/).map(i)):p=null,".INCLUDE"!==v)if(".ENDM"!==v)if(".MACRO"!==v)if(".REPT"!==v)h.push(e[m]);else{if(!p[0])throw{msg:"No repeat count given",s:e[m]};if(!(u=Parser.evaluate(p[0])))throw{msg:"Bad repeat count given",s:e[m]};if(d="*REPT"+e[m].numline,f[d])throw{msg:"Macro redefinition at line "+e[m].numline,s:e[m]};f[d]=[]}else{if(!p[0])throw{msg:"Bad macro name at line "+e[m].numline,s:e[m]};if(d=p[0].toUpperCase(),f[d])throw{msg:"Macro redefinition at line "+e[m].numline,s:e[m]};f[d]=[]}else{if(!d)throw{msg:"ENDM without MACRO at line "+e[m].numline,s:e[m]};if(u){h.push({numline:e[m].numline,line:";rept unroll",addr:null,bytes:0,remark:"REPT unroll"});for(var M=0;M<u;M++)for(var S=0;S<f[d].length;S++){var A=f[d][S].line;h.push({numline:e[M].numline,line:A,addr:null,bytes:0})}}d=null,u=null}else{if(!p||!p[0])throw{msg:"No file name given",s:e[m]};if(o[p[0].replace(/\"/g,"")])throw{msg:"File "+p[0].replace(/\"/g,"")+" is already included elsewhere - maybe recursion",s:e[m]};var b=n(p[0].replace(/\"/g,""));if(!b)throw{msg:"File "+p[0]+" not found",s:e[m]};var N=s(b.split(/\n/));N=t(N),N=a(N);for(var y=c(N),C=0;C<y[0].length;C++)y[0][C].includedFile=p[0].replace(/\"/g,""),h.push(y[0][C]);for(C in y[1])f[C]=y[1][C];o[p[0].replace(/\"/g,"")]=b}}else{if(d){f[d].push(e[m]);continue}h.push(e[m])}if(d)throw{msg:"MACRO "+d+" has no appropriate ENDM",s:e[m]};return[h,f]},f=function(e,n){var o={line:e.line,addr:e.addr,macro:e.macro,numline:e.numline};n=n||[];for(var r=0;r<n.length;r++)o.line=o.line.replace("%%"+(r+1),n[r]);return o},d=function(e,n){for(var o=[],r=0;r<e.length;r++){var a=e[r];if(a.macro)for(var t=n[a.macro],l=0;l<t.length;l++){var s=p(f(t[l],a.params),n);a.label&&(s.label=a.label),a.label="",s.remark=a.remark,s.macro=a.macro,a.macro=null,a.remark="",o.push(s)}else o.push(a)}return o},u={},h=function(e,n){for(var o=e.toString(16);o.length<n;)o="0"+o;return o.toUpperCase()},m=function(e){return h(255&e,2)},g=function(e){return h(e,4)},v=function(e){return h(e,6)},E=function(e){if(ASM.PRAGMAS.RELAX)return"string"==typeof e?255&e.charCodeAt(0):255&e;if("string"==typeof e){if(1!=e.length)throw"String parameter too long ("+e+")";return 255&e.charCodeAt(0)}if(e>255)throw"Param out of bound ("+e+")";if(e<-128)throw"Param out of bound ("+e+")";return 255&e},M=function(e,n){var o=":",r=n.length,a=0;o+=m(r),o+=g(e),o+="00",a=r+Math.floor(e/256)+Math.floor(e%256);for(var t=0;t<n.length;t++)o+=m(n[t]),a+=n[t];return o+=m(256-a%256)},S=function(e,n,o){var r=0,a=[],t=16;o>1&&(t=o);for(var l="",s=0;s<n.length;s++)a.push(n[s]),++r===t&&(l+=M(e,a)+"\n",a=[],r=0,e+=t);return a.length&&(l+=M(e,a)+"\n"),l},A=function(e,n){var o="S1",r=n.length,a=0;o+=m(r+3),o+=g(e),a=r+3+Math.floor(e/256)+Math.floor(e%256);for(var t=0;t<n.length;t++)o+=m(n[t]),a+=n[t];return o+=m(256-a%256)},b=function(e,n){for(var o=0,r=[],a="",t=0;t<n.length;t++)r.push(n[t]),16==++o&&(a+=A(e,r)+"\n",r=[],o=0,e+=16);return r.length&&(a+=A(e,r)+"\n"),a},N=function(e,n){var o="S2",r=n.length,a=0;o+=m(r+4),o+=v(e),a=r+4+Math.floor(e/65536)+Math.floor(e/256)%256+Math.floor(e%256);for(var t=0;t<n.length;t++)o+=m(n[t]),a+=n[t];return o+=m(255-a%256)},y=function(e,n){for(var o=0,r=[],a="",t=0;t<n.length;t++)r.push(n[t]),16==++o&&(a+=N(e,r)+"\n",r=[],o=0,e+=16);return r.length&&(a+=N(e,r)+"\n"),a};return{parse:function(n,l){e=l,l.endian&&(r=l.endian),o={};var i=s(n.split(/\n/));i=t(i),i=a(i);var f=c(i);return i=f[0].map(function(e){return p(e,f[1])}),i=d(i,f[1])},pass1:function(o,r){var a="CSEG",t=function(){if("BSSEG"===a)throw f.opcode+" is not allowed in BSSEG"},l={},s=0,i={};r&&(i=r);for(var p,c,f=null,d=0,h=0,m=[],g=0,v=0,E=o.length;v<E;v++)if(f=o[v],ASM.WLINE=o[v],f.pass=1,f.segment=a,f.addr=s,i._PC=s,0!==g&&(f.phase=g),"ENDIF"!==f.opcode)if("ELSE"!==f.opcode){if(!d)if("IF"!==f.opcode)if("IFN"!==f.opcode)if(".BLOCK"!==f.opcode)if(".ENDBLOCK"!==f.opcode){if(f.label){var M=f.label,S=!1;if("@"===M[0]&&(S=!0,M=M.substr(1),f.label=M,f.beGlobal=!0),f.beGlobal&&(S=!0),m.length>0&&(M=m.join("/")+"/"+M,i["__"+m.join("/")].push(f.label)),!r&&(i[M+"$"]||S&&void 0!==i[f.label]))throw{msg:"Redefine label "+f.label+" at line "+f.numline,s:f};i[f.label]?i[M]=i[f.label]:S&&(i[M]=s),u[f.label]={defined:{line:f.numline,file:f.includedFile||"*main*"},value:s},i[M+"$"]=s,i[f.label]=s,S&&(i[M]=s)}try{if(".ORG"===f.opcode){s=Parser.evaluate(f.params[0],i),f.addr=s,l[a]=s;continue}if(".CSEG"===f.opcode&&(l[a]=s,a="CSEG",f.segment=a,s=l[a]||0,f.addr=s),".DSEG"===f.opcode&&(l[a]=s,a="DSEG",f.segment=a,s=l[a]||0,f.addr=s),".ESEG"===f.opcode&&(l[a]=s,a="ESEG",f.segment=a,s=l[a]||0,f.addr=s),".BSSEG"===f.opcode&&(l[a]=s,a="BSSEG",f.segment=a,s=l[a]||0,f.addr=s),".PHASE"===f.opcode){if(g)throw{message:"PHASE cannot be nested"};var A=Parser.evaluate(f.params[0],i);f.addr=s,g=A-s,s=A;continue}if(".DEPHASE"===f.opcode){f.addr=s,s-=g,g=0;continue}if("EQU"===f.opcode){try{i[f.label]=Parser.evaluate(f.params[0],i)}catch(e){i[f.label]=null}u[f.label]={defined:{line:f.numline,file:f.includedFile||"*main*"},value:i[f.label]};continue}if("="===f.opcode){i[f.label]=Parser.evaluate(f.params[0],i),u[f.label]={defined:{line:f.numline,file:f.includedFile||"*main*"},value:i[f.label]};continue}}catch(e){throw{msg:e.message,s:f}}if("DB"===f.opcode||"FCB"===f.opcode)for(t(),f.bytes=0,c=0;c<f.params.length;c++)try{if("number"==typeof(p=Parser.evaluate(f.params[c],i))){f.bytes++;continue}if("string"==typeof p){f.bytes+=p.length;continue}}catch(e){f.bytes++}if(".CSTR"===f.opcode||".PSTR"===f.opcode||".ISTR"===f.opcode){for(t(),f.bytes=0,c=0;c<f.params.length;c++)try{if("number"==typeof(p=Parser.evaluate(f.params[c],i))){f.bytes++;continue}if("string"==typeof p){f.bytes+=p.length;continue}}catch(e){f.bytes++}".CSTR"!==f.opcode&&".PSTR"!==f.opcode||f.bytes++}if("DS"!==f.opcode&&"RMB"!==f.opcode)if("ALIGN"!==f.opcode)if("FILL"!==f.opcode)if("BSZ"!==f.opcode&&"ZMB"!==f.opcode){if("DW"===f.opcode||"FDB"===f.opcode)for(t(),f.bytes=0,c=0;c<f.params.length;c++)try{if("number"==typeof(p=Parser.evaluate(f.params[c],i))){f.bytes+=2;continue}}catch(e){f.bytes+=2}if(".INCBIN"!==f.opcode)if(".M16"!==f.opcode)if(".M8"!==f.opcode)if(".X16"!==f.opcode)if(".X8"!==f.opcode){var b=e.parseOpcode(o[v],i);b&&(t(),f=b),s+=f.bytes}else i.__MX=8;else i.__MX=16;else i.__AX=8;else i.__AX=16;else{if(t(),!f.params[0])throw{msg:"No file name given at line "+f.numline,s:f};var N=n(f.params[0],!0);if(!N)throw{msg:"Cannot find file "+f.params[0]+" for incbin",s:f};for(f.bytes=0,f.lens=[],P=0;P<N.length;P++){var y=N.charCodeAt(P);y>255&&(f.lens[f.bytes++]=y>>8),f.lens[f.bytes++]=y%256}s+=f.bytes}}else{for(t(),I=Parser.evaluate(f.params[0],i),f.bytes=I,f.lens=[],P=0;P<I;P++)f.lens[P]=0;s+=I}else{for(t(),I=Parser.evaluate(f.params[1],i),"string"==typeof(p=Parser.evaluate(f.params[0],i))&&(p=p.charCodeAt(0)),f.bytes=I,f.lens=[],P=0;P<I;P++)f.lens[P]=p;s+=I}else{var C=Parser.evaluate(f.params[0],i);s+=s%C>0?C-s%C:0}else{var I=Parser.evaluate(f.params[0],i);if(2==f.params.length){"string"==typeof(p=Parser.evaluate(f.params[1],i))&&(p=p.charCodeAt(0)),f.bytes=I,f.lens=[];for(var P=0;P<I;P++)f.lens[P]=p}s+=I}}else{for(var D=i["__"+m.join("/")],F=0;F<D.length;F++)i[D[F]]=i[m.join("/")+"/"+D[F]],i[m.join("/")+"/"+D[F]]=null;m.pop(),i.__blocks=JSON.stringify(m)}else{m.push(f.numline);var R=m.join("/");i["__"+R]=[]}else{if(h)throw{msg:"Nested IFs are not supported",s:f};try{Parser.evaluate(f.params[0],i)&&(d=1),h=1}catch(e){throw{msg:"IF condition canot be determined",s:f}}}else{if(h)throw{msg:"Nested IFs are not supported",s:f};try{Parser.evaluate(f.params[0],i)||(d=1),h=1}catch(e){throw{msg:"IF condition canot be determined",s:f}}}}else{if(!h)throw{msg:"ELSE without IF",s:f};d=d?0:1}else{if(!h)throw{msg:"ENDIF without IF",s:f};d=0,h=0}return[o,i]},pass2:function(e){for(var n,o,a,t=e[0],l=e[1],s=null,i=null,p=[],c=0,f=0,d=t.length;f<d;f++)try{if(s=t[f],s.pass=2,"ENDIF"===s.opcode){c=0;continue}if("ELSE"===s.opcode){c=c?0:1;continue}if(c)continue;if("IF"===s.opcode){Parser.evaluate(s.params[0],l);try{Parser.evaluate(s.params[0],l)||(c=1)}catch(e){throw{message:"IF condition mismatched"}}continue}if("IFN"===s.opcode){try{Parser.evaluate(s.params[0],l)&&(c=1)}catch(e){throw{message:"IF condition mismatched"}}continue}l._PC=s.addr;try{for(var h=Parser.usage(s.params[0].toUpperCase(),l),m=0;m<h.length;m++)u[h[m]].usage||(u[h[m]].usage=[]),u[h[m]].usage.push({line:s.numline,file:s.includedFile||"*main*"})}catch(e){}try{for(var h=Parser.usage(s.params[1].toUpperCase(),l),m=0;m<h.length;m++)u[h[m]].usage||(u[h[m]].usage=[]),u[h[m]].usage.push({line:s.numline,file:s.includedFile||"*main*"})}catch(e){}if(".BLOCK"===s.opcode){p.push(s.numline);for(var g=l["__"+p.join("/")],v=0;v<g.length;v++)l[p.join("/")+"/"+g[v]]=l[g[v]],l[g[v]]=l[p.join("/")+"/"+g[v]+"$"];continue}if(".ENDBLOCK"===s.opcode){for(var g=l["__"+p.join("/")],v=0;v<g.length;v++)l[g[v]]=l[p.join("/")+"/"+g[v]],void 0===l[g[v]]&&delete l[g[v]],l[p.join("/")+"/"+g[v]]=null;p.pop();continue}if(".ENT"===s.opcode){ASM.ENT=Parser.evaluate(s.params[0],l);continue}if(".BINFROM"===s.opcode){ASM.BINFROM=Parser.evaluate(s.params[0],l);continue}if(".BINTO"===s.opcode){ASM.BINTO=Parser.evaluate(s.params[0],l);continue}if(".ENGINE"===s.opcode){ASM.ENGINE=s.params[0];continue}if(".PRAGMA"===s.opcode){ASM.PRAGMAS=ASM.PRAGMAS||[],ASM.PRAGMAS.push(s.params[0].toUpperCase());continue}if("EQU"===s.opcode){l[s.label]=Parser.evaluate(s.params[0],l);continue}if("DB"===s.opcode||"FCB"===s.opcode){for(o=0,s.lens=[],a=0;a<s.params.length;a++)if("number"!=typeof(n=Parser.evaluate(s.params[a],l)))if("string"!=typeof n);else for(M=0;M<n.length;M++)s.lens[o++]=n.charCodeAt(M);else s.lens[o++]=Math.floor(n%256);continue}if(".CSTR"===s.opcode){for(o=0,s.lens=[],a=0;a<s.params.length;a++)if("number"!=typeof(n=Parser.evaluate(s.params[a],l)))if("string"!=typeof n);else for(M=0;M<n.length;M++)s.lens[o++]=n.charCodeAt(M);else s.lens[o++]=Math.floor(n%256);s.lens[o++]=0;continue}if(".PSTR"===s.opcode){for(o=1,s.lens=[],a=0;a<s.params.length;a++)if("number"!=typeof(n=Parser.evaluate(s.params[a],l)))if("string"!=typeof n);else for(M=0;M<n.length;M++)s.lens[o++]=n.charCodeAt(M);else s.lens[o++]=Math.floor(n%256);s.lens[0]=o-1;continue}if(".ISTR"===s.opcode){for(o=0,s.lens=[],a=0;a<s.params.length;a++)if("number"!=typeof(n=Parser.evaluate(s.params[a],l)))if("string"!=typeof n);else for(var M=0;M<n.length;M++)s.lens[o++]=127&n.charCodeAt(M);else s.lens[o++]=Math.floor(n%128);s.lens[o-1]=128|s.lens[o-1];continue}if("DW"===s.opcode||"FDB"===s.opcode){for(o=0,s.lens=[],a=0;a<s.params.length;a++)"number"!=typeof(n=Parser.evaluate(s.params[a],l))||(r?(s.lens[o++]=Math.floor(n/256),s.lens[o++]=Math.floor(n%256)):(s.lens[o++]=Math.floor(n%256),s.lens[o++]=Math.floor(n/256)));continue}if(s.lens&&s.lens[1]&&"function"==typeof s.lens[1]&&("addr24"===s.lens[2]?(i=s.lens[1](l),r?(s.lens[3]=Math.floor(i%256),s.lens[2]=Math.floor((i>>8)%256),s.lens[1]=Math.floor(i>>16&255)):(s.lens[1]=Math.floor(i%256),s.lens[2]=Math.floor((i>>8)%256),s.lens[3]=Math.floor(i>>16&255))):null===s.lens[2]?"string"==typeof(i=s.lens[1](l))?r?(s.lens[1]=255&i.charCodeAt(0),s.lens[2]=255&i.charCodeAt(1)):(s.lens[2]=255&i.charCodeAt(0),s.lens[1]=255&i.charCodeAt(1)):r?(s.lens[2]=Math.floor(i%256),s.lens[1]=Math.floor(i/256)):(s.lens[1]=Math.floor(i%256),s.lens[2]=Math.floor(i/256)):(i=s.lens[1](l),s.lens[1]=E(i))),s.lens&&s.lens.length>2&&"function"==typeof s.lens[2]&&(i=s.lens[2](l),null===s.lens[3]?"string"==typeof(i=s.lens[2](l))?r?(s.lens[2]=255&i.charCodeAt(0),s.lens[3]=255&i.charCodeAt(1)):(s.lens[3]=255&i.charCodeAt(0),s.lens[2]=255&i.charCodeAt(1)):r?(s.lens[3]=255&i,s.lens[2]=i>>8):(s.lens[2]=255&i,s.lens[3]=i>>8):s.lens[2]=E(i)),s.lens&&s.lens.length>3&&"function"==typeof s.lens[3]&&(i=s.lens[3](l),null===s.lens[4]?"string"==typeof(i=s.lens[3](l))?r?(s.lens[3]=255&i.charCodeAt(0),s.lens[4]=255&i.charCodeAt(1)):(s.lens[4]=255&i.charCodeAt(0),s.lens[3]=255&i.charCodeAt(1)):r?(s.lens[4]=255&i,s.lens[3]=i>>8):(s.lens[3]=255&i,s.lens[4]=i>>8):s.lens[3]=E(i)),s.lens&&s.lens.length>1){if("string"==typeof s.lens[1]&&(s.lens[1]=s.lens[1].charCodeAt(0)),isNaN(s.lens[1]))throw{message:"param out of bounds, NaN"};if(s.lens[1]>255||s.lens[1]<-128)throw{message:"param out of bounds - "+s.lens[1]};s.lens[1]<0&&(s.lens[1]=256+s.lens[1])}}catch(e){throw{msg:e.message,s:s,e:e}}return[t,l]},parseLine:p,ENT:null,WLINE:null,compile:function(e,n){try{ASM.ENT=null,ASM.BINFROM=null,ASM.BINTO=null,ASM.ENGINE=null,ASM.PRAGMAS=[];var o=ASM.parse(e,n);u={};var r=ASM.pass1(o);return r=ASM.pass1(r[0],r[1]),r=ASM.pass1(r[0],r[1]),r=ASM.pass1(r[0],r[1]),r=ASM.pass1(r[0],r[1]),r=ASM.pass1(r[0],r[1]),r=ASM.pass1(r[0],r[1]),r=ASM.pass2(r),[null,r,u]}catch(e){return e.e&&(e="Object"==typeof e.e?e.e:{msg:e.e,s:e.s}),!e.msg&&e.message&&(e.msg=e.message),e.msg?[e,null]:["Cannot evaluate line "+ASM.WLINE.numline+", there is some unspecified error (e.g. reserved world as label etc.)",null]}},compileAsync:function(e,n,o){try{var r=ASM.parse(e,n),a=ASM.pass1(r);a=ASM.pass2(a),o(null,a)}catch(e){o(e,null)}},lst:function(e,n,o,r,a){var t,l,s="";void 0===r&&(r=!1);for(var i=0,p=e.length;i<p;i++){if(l=e[i],t="",l.macro&&!o&&(t+="        **MACRO UNROLL - "+l.macro+"\n"),void 0!==l.addr&&(t+=g(l.addr),l.phase&&(t+=" @"+g(l.addr-l.phase)),t+=r?" ":"   "),l.lens)for(var c=0;c<l.lens.length;c++)t+=m(l.lens[c])+" ";if(!r)for(;t.length<20;)t+=" ";if(r)for(;t.length<15;)t+=" ";if(l.label&&(t+=l.label+":   "),!r)for(;t.length<30;)t+=" ";if(r)for(;t.length<22;)t+=" ";l.opcode&&(t+=l.opcode+(r?" ":"   ")),l.params&&(t+=l.params+(r?" ":"   ")),l.remark&&(t+=";"+l.remark),s+=t+"\n"}if(o)return s;s+="\n\n";for(var f in u)if(null!==u[f]&&("_"!=f[0]||"_"!=f[1])&&"$"!==f[f.length-1]){for(t="",t+=f+": ";t.length<20;)t+=" ";if(t+=g(u[f].value),t+=" DEFINED AT LINE "+u[f].defined.line,"*main*"!=u[f].defined.file&&(t+=" IN "+u[f].defined.file),s+=t+"\n",u[f].usage)for(p=0;p<u[f].usage.length;p++)s+="                    > USED AT LINE "+u[f].usage[p].line,"*main*"!=u[f].usage[p].file&&(s+=" IN "+u[f].usage[p].file),s+="\n"}return s},html:function(e,n,o,r){var a,t,l="<html><head><meta charset=utf-8><body><table>";void 0===r&&(r=!1);for(var s=0,i=e.length;s<i;s++){if(t=e[s],a='<tr id="ln'+t.numline+'">',t.macro&&!o&&(a+="        **MACRO UNROLL - "+t.macro+"\n"),void 0!==t.addr?(a+='<td><a name="ADDR'+g(t.addr)+'">'+g(t.addr)+"</a>",t.phase?a+="</td><td>"+g(t.addr-t.phase):a+="</td><td>",a+="</td>"):a+="<td></td><td></td>",t.lens){a+="<td>";for(var p=0;p<t.lens.length;p++)a+=m(t.lens[p])+" ";a+="</td>"}else a+="<td></td>";t.label?a+='<td><a name="LBL'+t.label+'">'+t.label+"</a></td>":a+="<td></td>",t.opcode?a+="<td>"+t.opcode+"</td>":a+="<td></td>",t.params?a+="<td>"+t.params.map(function(e){e+="";for(var o in n)if(null!==n[o]&&("_"!=o[0]||"_"!=o[1])&&"$"!==o[o.length-1]){var r=new RegExp("^"+o+"$","i");if(e.match(r))return'<a href="#LBL'+o+'">'+e+"</a>"}return e})+"</td>":a+="<td></td>",t.remark?a+="<td>;"+t.remark+"</td>":a+="<td></td>",l+=a+"</tr>\n"}return l+="</table>"},hex:function(e,n){for(var o,r=null,a=0,t=[],l="",s=!1,i=16,p=0,c=e.length;p<c;p++)if(".PRAGMA"===(o=e[p]).opcode&&(2==o.params.length&&"HEXLEN"==o.params[0].toUpperCase()&&((i=parseInt(o.params[1]))<1||i>64)&&(i=16),1==o.params.length&&"SEGMENT"==o.params[0].toUpperCase()&&(s=!0)),!s||(n||(n="CSEG"),o.segment==n)){var f=o.addr;if(o.phase&&(f-=o.phase),void 0!==f&&0===a&&(r=f),f!=r+a&&(a&&(l+=S(r,t,i)),r=f,a=0,t=[]),o.lens){for(var d=0;d<o.lens.length;d++)t.push(o.lens[d]);a+=o.lens.length}}return t.length&&(l+=S(r,t,i)),l+=":00000001FF"},srec:function(e,n){for(var o,r=null,a=0,t=!1,l=[],s="",i=0,p=e.length;i<p;i++)if(".PRAGMA"===(o=e[i]).opcode&&1==o.params.length&&"SEGMENT"==o.params[0].toUpperCase()&&(t=!0),!t||(n||(n="CSEG"),o.segment==n)){var c=o.addr;if(o.phase&&(c-=o.phase),void 0!==c&&0===a&&(r=c),c!=r+a&&(a&&(s+=b(r,l)),r=c,a=0,l=[]),o.lens){for(var f=0;f<o.lens.length;f++)l.push(o.lens[f]);a+=o.lens.length}}l.length&&(s+=b(r,l));var d=ASM.ENT||0,u=3+Math.floor(d/256)+Math.floor(d%256);return s+="S903"+g(d)+m(255-u%256)},srec28:function(e,n){for(var o,r=null,a=0,t=!1,l=[],s="",i=0,p=e.length;i<p;i++)if(".PRAGMA"===(o=e[i]).opcode&&1==o.params.length&&"SEGMENT"==o.params[0].toUpperCase()&&(t=!0),!t||(n||(n="CSEG"),o.segment==n)){var c=o.addr;if(o.phase&&(c-=o.phase),void 0!==c&&0===a&&(r=c),c!=r+a&&(a&&(s+=y(r,l)),r=c,a=0,l=[]),o.lens){for(var f=0;f<o.lens.length;f++)l.push(o.lens[f]);a+=o.lens.length}}l.length&&(s+=y(r,l));var d=ASM.ENT||0,u=3+Math.floor(d/256)+Math.floor(d%256);return s+="S804"+v(d)+m(255-u%256)+"\n"},linemap:function(e){for(var n,o=[],r=0,a=e.length;r<a;r++)if((n=e[r]).lens)for(var t=0;t<n.lens.length;t++)o[n.addr+t]=r+1;return o},beautify:function(n,o){e=o;var r=s(n.split(/\n/));r=l(r),r=t(r),r=a(r);var i=c(r);r=r.map(function(e){return p(e,i[1])});for(var f,d,u="",h=0;h<r.length;h++)if(f=r[h],d="","EMPTYLINE"!=f.remark){for(f.label&&(d+=f.label,"EQU"!=f.opcode&&"="!=f.opcode&&(d+=":"),d+=" ");d.length<12;)d+=" ";for(f.opcode&&(d+=f.opcode+" ");d.length<20;)d+=" ";f.params&&(d+=f.params+" "),f.remark&&(d+=";"+f.remark),u+=d+"\n"}else u+="\n";return u},buff:function(e){for(var n,o,r=new Uint8Array(65536),a=0,t=e.length;a<t;a++)if(n=e[a],o=n.addr,n.lens)for(var l=0;l<n.lens.length;l++)r[o++]=n.lens[l];return r},fileGet:function(e){n=e}}});
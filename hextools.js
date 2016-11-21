/*global Uint8Array, Buffer, process*/
/* eslint-disable no-console */

var rle1Decode = function(encoded) {
    var output = [];
    encoded.forEach(function(pair){
      if (typeof pair == "number") {output.push(pair);return;}
      for (var i=0;i<pair[0];i++) { output.push(pair[1]);}
    });
    return output;
};

/*
var toHexN = function(n,d) {
    var s = n.toString(16);
    while (s.length <d) {s = '0'+s;}
    return s.toUpperCase();
};

var toHex2 = function(n) {return toHexN(n & 0xff,2);};
var toHex4 = function(n) {return toHexN(n & 0xffff,4);};
*/

var makeSNA = function(V,entry) {

  var dummyRLE = [63,56,0,184,0,15,23,68,0,168,16,185,92,33,23,58,92,212,3,4,202,92,0,240,127,1,15,[4576,0],124,60,66,120,60,66,62,[2,126],0,66,60,124,[3,0],16,64,[238,0],[2,66],98,68,66,102,8,4,64,0,66,64,66,0,56,120,56,64,[238,0],[2,66],82,[2,66],90,[2,8],124,0,66,60,66,0,[2,68],16,64,[238,0],124,126,74,[3,66],8,16,64,0,66,2,124,0,120,68,16,64,[238,0],68,66,70,68,[2,66],8,32,64,0,[2,66],68,0,64,68,16,64,[238,0],[3,66],120,60,66,62,[2,126],0,[2,60],66,0,60,68,12,126,[270,0],[753,56],184,[14,56],[256,0],255,0,29,249,255,0,33,[2,116],35,5,[5,0],1,0,6,0,11,0,1,0,1,0,6,0,16,[26,0],60,64,0,255,204,1,248,127,252,127,[3,0],255,254,255,1,56,[2,0],203,92,218,92,182,92,182,92,203,92,234,92,202,92,212,92,217,92,233,92,[2,0],219,92,219,92,219,92,0,146,92,16,2,[6,0],37,74,125,26,[2,0],121,10,0,88,255,[2,0],33,0,91,15,23,0,64,224,80,33,24,33,23,1,56,0,56,[34,0],255,127,[2,255],244,9,168,16,75,244,9,196,21,83,129,15,196,21,82,244,9,196,21,80,128,165,110,244,[2,0],64,156,0,128,249,192,101,110,116,13,128,110,[2,48],14,[2,0],64,156,0,13,128,[2,0],64,156,[8918,0],243,13,206,11,236,80,206,11,237,80,20,23,220,10,206,11,241,80,16,23,220,10,215,24,56,0,56,0,13,25,217,92,169,24,219,2,77,0,185,92,219,2,77,0,184,0,15,23,254,21,[2,0],225,21,59,15,127,16,252,127,180,18,0,62,[32536,0],243,13,206,11,228,80,206,11,229,80,28,23,220,10,206,11,235,80,22,23,220,10,215,24,177,51,222,92,5,0,219,2,219,2,77,0,208,82,48,0,207,82,4,2,92,14,192,87,113,14,243,13,33,23,198,30,255,127,118,27,3,19,0,62,0,60,[2,66],126,[2,66],[2,0],124,66,124,[2,66],124,[2,0],60,66,[2,64],66,60,[2,0],120,68,[2,66],68,120,[2,0],126,64,124,[2,64],126,[2,0],126,64,124,[3,64],[2,0],60,66,64,78,66,60,[2,0],[2,66],126,[3,66],[2,0],62,[4,8],62,[2,0],[3,2],[2,66],60,[2,0],68,72,112,72,68,66,[2,0],[5,64],126,[2,0],66,102,90,[3,66],[2,0],66,98,82,74,70,66,[2,0],60,[4,66],60,[2,0],124,[2,66],124,[2,64],[2,0],60,[2,66],82,74,60,[2,0],124,[2,66],124,68,66,[2,0],60,64,60,2,66,60,[2,0],254,[5,16],[2,0],[5,66],60,0];

  var sna = new Uint8Array(65536+27);
  var dummySNA = rle1Decode(dummyRLE);
  var i;
  for(i=0;i<dummySNA.length;i++) {
    sna[i] = dummySNA[i];
  }
  for(i=0;i<V.length;i++){
    var op = V[i];
    var addr = op.addr;
    if (!op.lens) continue;
    for (var j=0;j<op.lens.length;j++){
      sna[j+addr-16384+27]=op.lens[j];
    }
  }

  if(entry) {
  sna[0x1ceb] = (entry & 0xff);
  sna[0x1cec] = (entry >> 8) & 0xff;
  }
  //sna[0x1cfc] = 0x00;
  //sna[0x1cfd] = 0x80;
  //sna[0x1d03] = 0x00;
  //sna[0x1d04] = 0x80;

  return new Buffer(sna);
};


var aconcat = function(a,b) {
  var out=[];
  var i;
  for (i=0;i<a.length;i++) {out.push(a[i]);}
  for (i=0;i<b.length;i++) {out.push(b[i]);}
  return out;
};

var tapdata = function(data,type) {
  var out=[];
  var sum = type;
  var len;
  out[0]=type;
  for(var i=0;i<data.length;i++){
    out.push(data[i]);
    sum = (sum ^ data[i])&0xff;
  }
  out.push(sum);
  len = out.length;
  out.unshift(len >>8);
  out.unshift(len&0xff);
  return out;
};


var makeTapBlock = function(addr,data, num) {
  var len = data.length;
  var file = [3,67,79,68,69,48+Math.floor(num/10),48+(num%10),32,32,32,32,len&0xff,len>>8,addr&0xff,addr>>8,0,128];
  return aconcat(tapdata(file,0), tapdata(data,255));
};

var makeTAP = function(V) {
  var op;
  var addr = null;
  var len = 0;
  var dta = [];
  var out = [];
  var num=0;
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
        out=aconcat(out,makeTapBlock(addr,dta,num++));
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
  if (dta.length) {out=aconcat(out,makeTapBlock(addr,dta,num++));}
  return new Buffer(out);
};

var RAM=[];


var  hexLine = function(ln, offset) {
    var i;
    if (ln[0]!==':') {return false;}
    var len = parseInt(ln[1]+ln[2], 16);
    var start = parseInt(ln[3]+ln[4]+ln[5]+ln[6], 16);
    var typ = parseInt(ln[7]+ln[8], 16);
    offset = offset || 0;
    var addrx;
    if (typ===0) {
        for (i=0;i<len;i++) {
            RAM[start+i+offset] = parseInt(ln[9+2*i]+ln[10+2*i], 16);
            addrx=start+i;
        }
    }
    return addrx;
  };

var  readHex = function(hex, offset) {
  var hexlines = hex.split(/\n/);
  var lastaddr = 0;
  for(var i=0;i<hexlines.length;i++){
      var lb = hexLine(hexlines[i],offset);
      if (lb>lastaddr) lastaddr=lb;
  }
  return lastaddr;
  };

var  hex2com = function(hex) {
    RAM=new Uint8Array(65536);
    var lastaddr = readHex(hex,0)+1;
    var out = RAM.subarray(0x100,lastaddr);
    return Buffer.from(out);
  };


var  hex2prg = function(hex,ent) {
    if (ent<0x810) {console.log("ENT must be above $810"); process.exit(-1);}
    RAM=new Uint8Array(65536);
    var lastaddr = readHex(hex,0)+1;
    var out;
    var e = ent+'';
    RAM[0x7ff] = 0x01;
    RAM[0x800] = 0x08;
    RAM[0x801] = 0x0c;
    RAM[0x802] = 0x08;
    RAM[0x803] = 0x0a;
    RAM[0x804] = 0x00;
    RAM[0x805] = 0x9e;
    RAM[0x806] = e.charCodeAt(0);
    RAM[0x807] = e.charCodeAt(1);
    RAM[0x808] = e.charCodeAt(2);
    RAM[0x809] = e.charCodeAt(3);
    RAM[0x80a] = 0x00;
    RAM[0x80b] = 0x00;
    RAM[0x80c] = 0x00;

    out = RAM.subarray(0x7ff,lastaddr);
/*
    for(var i=0x7ff;i<lastaddr;i++) {
      out+=String.fromCharCode(RAM[i]);
    }
    */
    return Buffer.from(out);
  };

  module.exports = {
    "hex2prg": hex2prg,
    "hex2com": hex2com,
    "makeSNA": makeSNA,
    "makeTAP": makeTAP

};

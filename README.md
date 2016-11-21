# ASM80.js

[![NPM Version](http://img.shields.io/npm/v/asm80.svg?style=flat)](https://www.npmjs.org/package/asm80)
[![NPM Downloads](https://img.shields.io/npm/dm/asm80.svg?style=flat)](https://www.npmjs.org/package/asm80)

  The Assember for the 8bit CPUs

## Installation

  $ npm install asm80 -g

## Usage

  asm80 [options] <file>

  Assembles given file, e.g. test.z80, into two files: test.hex (binary) and test.lst (listing).

  Options are:

  `-o, --output <file>` Output file name
  `-t, --type <type>` Output type [default: hex]
  `-n, --nolist` Suppress listing (.lst file)
  `-m, --machine <type>` Processor type, one of the following: Z80, I8080, C6502, C65816, CDP1802, M6800, M6809
  `-h, --help` See HELP

  Machine type can be omitted. Right CPU is determined by file name extension.

  - Intel 8080: .A80
  - Zilog Z80: .Z80
  - Motorola 6800: .A68
  - Motorola 6809: .A09
  - MOS 6502: .A65
  - WDT 65816: .816
  - CDP 1802: .A18

## More info

  See https://www.uelectronics.info/category/my-projects/
  or http://www.asm80.com for online IDE, based on this assembler

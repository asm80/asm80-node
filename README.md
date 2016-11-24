# ASM80.js

[![NPM Version](http://img.shields.io/npm/v/asm80.svg?style=flat)](https://www.npmjs.org/package/asm80)
[![NPM Downloads](https://img.shields.io/npm/dm/asm80.svg?style=flat)](https://www.npmjs.org/package/asm80)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/02de4cbfc6fc4ff1a9c0fe4e16d72bde)](https://www.codacy.com/app/maly/asm80-node?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=maly/asm80-node&amp;utm_campaign=Badge_Grade)

  The Assembler for the 8bit CPUs

## Installation

  $ npm install asm80 -g

## Usage

  asm80 [options] filename

  Assembles given the file, e.g. test.z80, into two files: test.hex (binary) and test.lst (listing).

  Options are:

  - `-o, --output <file>` Output file name
  - `-t, --type <type>` Output type [default: hex]. Available types are: hex, srec, com (for CP/M), sna, tap (for ZX Spectrum), prg (for C64)
  - `-n, --nolist` Suppress listing (.lst file)
  - `-m, --machine <type>` Processor type, one of the following: Z80, I8080, C6502, C65816, CDP1802, M6800, M6809
  - `-h, --help` See HELP

  Machine type can be omitted. Right CPU is determined by file name extension (-m option overrides this decision).

  - Intel 8080: .A80
  - Zilog Z80: .Z80
  - Motorola 6800: .A68
  - Motorola 6809: .A09
  - MOS 6502: .A65
  - WDT 65816: .816
  - CDP 1802: .A18

## Format, directives etc.

  See [ASM80 GitHub Pages](https://maly.github.io/asm80-node/) for further information.

## More info

  See https://www.uelectronics.info/category/my-projects/ for more info

  or http://www.asm80.com for online IDE, based on this assembler

## Changes

  - 0.9.11: Incbin fixed
  - 0.9.10: Manual reference added
  - 0.9.9: First working version

#!/usr/bin/env node
'use strict';

const program = require('commander');
const fs = require('fs');
const pjson = require('../package.json');
// const restdiff = require('./restdiff');

let fileText = null;

program
  .version(pjson.version)
  .arguments('[file]>')
  .action(function (file) {
    if (file) {
      fileText = fs.readFileSync(file, 'utf8');
    }
  })
  .option('-s, --sync', 'Run in synchronous mode')
  .option('-v, --verbose', 'Verbose output')
  .option('-o, --output [folder]', 'Write all requests to this folder.')
  .option('-i, --stdin', 'Read from standard in')
  .parse(process.argv);

// Read standin if it is there
if (program.stdin) {
  process.stdin.resume();
  process.stdin.on('data', function (buf) { fileText += buf.toString(); });
  process.stdin.on('end', function () {
    runDiff(fileText);
  });
} else {
  runDiff(fileText);
}

function runDiff (requests) {
  if (requests !== null) {
    /* let results = restdiff.run(JSON.parse(requests), {
      async: !program.sync
      output: program.output
    }); */
    console.log(requests);
  } else {
    console.log(program);
    console.log('No requests found.');
    process.exit(-1);
  }
  process.exit(0);
}

process.on('SIGINT', function () {
  console.log('Goodbye cruel world');
  process.exit(0);
});

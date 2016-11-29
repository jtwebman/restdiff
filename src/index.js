#!/usr/bin/env node
'use strict';

process.on('SIGINT', function () {
  console.log('Goodbye cruel world');
  process.exit(0);
});

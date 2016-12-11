'use strict';

const _ = require('lodash');

function match (results) {
  return !_.some(results.log, f => !f.match);
}

function getFailed (results) {
  return results.log.filter(f => !f.match);
}

function addMatch (results, path) {
  if (results.options.trackMatches) {
    results.log.push({
      path: path,
      match: true
    });
  }
  return results;
}

function addFailed (results, path, message) {
  results.log.push({
    path: path,
    match: false,
    message: message
  });
  return results;
}

module.exports = {
  addMatch: addMatch,
  addFailed: addFailed,
  match: match,
  getFailed: getFailed,
  empty: {
    options: {
      trackMatches: false
    },
    log: []
  }
};

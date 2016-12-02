'use strict';

const _ = require('lodash');

function match (findings) {
  return !_.some(findings, f => !f.equal);
}

function getIssues (findings) {
  return findings.filter(f => !f.equal);
}

function getFailedResult (reason) {
  return [{
    path: '',
    reason: reason,
    equal: false
  }];
}

function getResult (path, equal, reason, value1, value2) {
  return [{
    path: path,
    equal: equal,
    reason: reason,
    value1: value1,
    value2: value2
  }];
}

function combine (results1, results2) {
  return results1.concat(results2);
}

module.exports = {
  match: match,
  getIssues: getIssues,
  getResult: getResult,
  getFailedResult: getFailedResult,
  combine: combine,
  empty: []
};

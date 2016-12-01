'use strict';

const _ = require('lodash');

function match (findings) {
  return !_.some(findings, f => !f.equal);
}

function issues (findings) {
  return findings.filter(f => !f.equal);
}

function getResults (findings) {
  return {
    match: match(findings),
    issues: issues(findings),
    findings: findings
  };
}

function getFailedResult (reason) {
  return {
    match: false,
    issues: [ { path: '', reason: reason, equal: false } ],
    findings: [ { path: '', reason: reason, equal: false } ]
  };
}

module.exports = {
  getResults: getResults,
  getFailedResult: getFailedResult
};

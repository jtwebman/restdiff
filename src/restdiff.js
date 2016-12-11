'use strict';

const async = require('async');
const request = require('request');
const _ = require('lodash');
const result = require('./result');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const jsonType = require('./jsonType');
const jsonDiff = require('./jsonDiff');

let allOptions;

function run (requests, options, cb) {
  allOptions = _.assign({
    async: true,
    output: null
  }, options);

  if (allOptions.async) {
    runAsync(requests, allOptions, cb);
  } else {
    runSync(requests, allOptions, cb);
  }
}

function runSync (requests, options, cb) {
  async.mapSeries(requests, compareRequestsSync, cb);
}

function runAsync (requests, options, cb) {
  async.map(requests, compareRequestsAsync, cb);
}

function compareRequestsSync (req, cb) {
  console.log('Pulling: ' + req.name);
  async.series(getRequestArray(req), function (err, results) {
    if (err) {
      cb(err);
    } else {
      let result = compareRequests(results);
      console.log(getSingleResultString(result, allOptions));
      if (allOptions.output) {
        async.mapSeries(Object.keys(result.requests), (key, cb) => {
          let fullpath = path.join(allOptions.output, key, result.name + '.json');
          mkdirp(path.dirname(fullpath), function (err) {
            if (err) {
              cb(err);
            } else {
              let writeVal;
              try {
                let jsonReport = JSON.parse(result.requests[key].body);
                if (!jsonReport.total_count) {
                  console.log(req.name + ' has no data on "' + key + '".');
                }
                writeVal = JSON.stringify(jsonType.sort(jsonReport));
              } catch (err) {
                console.log(req.name + ' not json on "' + key + '".');
                if (result.requests[key].error) {
                  writeVal = result.requests[key].error;
                } else {
                  writeVal = result.requests[key].body;
                }
              }
              fs.writeFile(fullpath, writeVal, 'utf8', cb);
            }
          });
        }, err => {
          if (err) cb(err);
          cb(null, result);
        });
      }
    }
  });
}

function compareRequestsAsync (req, cb) {
  async.parallel(getRequestArray(req), function (err, results) {
    if (err) {
      cb(err);
    } else {
      cb(null, compareRequests(results));
    }
  });
}

function compareRequests (reqs) {
  return reqs.reduce(function (result, req, index, arr) {
    result.name = req.name;
    result.requests[req.type] = {
      statusCode: req.response && req.response.statusCode,
      body: req.body,
      error: req.error,
      compared: {}
    };
    for (let i = 0; i < arr.length; i++) {
      if (i !== index) {
        if (result[arr[i].type]) {
          result.requests[req.type].compared[arr[i].type] = result[arr[i].type].compared[req.type];
        } else {
          result.requests[req.type].compared[arr[i].type] = jsonDiff.diff(req, arr[i]);
        }
      }
    }
    return result;
  }, { requests: [] });
}

function getRequestArray (req) {
  return Object.keys(req.requests).map(function (key) {
    return function (cb) {
      request(req.requests[key], handleRequest(req.name, key, cb));
    };
  });
}

function handleRequest (name, type, cb) {
  return function (error, response, body) {
    if (error) console.log('error:', error);
    cb(null, {
      name: name,
      type: type,
      error: error,
      response: response,
      body: body
    });
  };
}

function resultsToString (results, options) {
  let allOptions = _.assign({
    verbose: false
  }, options);

  return results.reduce((text, r) => {
    return text + getSingleResultString(r, allOptions);
  }, '');
}

function getSingleResultString (r, options) {
  if (_.some(Object.keys(r.requests), reqKey => {
    return _.some(Object.keys(r.requests[reqKey].compared), compareKey => {
      return !result.match(r.requests[reqKey].compared[compareKey]);
    });
  })) {
    return getFailedResultsString(r, options);
  } else {
    return r.name + ': Passed\n';
  }
}

function getFailedResultsString (r, options) {
  let text = '';
  text += r.name + ': Failed!\n';
  if (options.verbose) {
    Object.keys(r.requests).forEach(reqKey => {
      text += '\t' + reqKey + ':\n';
      Object.keys(r.requests[reqKey].compared).forEach(compareKey => {
        let matched = result.match(r.requests[reqKey].compared[compareKey]);
        if (matched) {
          text += '\t\t' + compareKey + ': Matched\n';
        } else {
          text += '\t\t' + compareKey + ': Failed\n';
          r.requests[reqKey].compared[compareKey].forEach(f => {
            if (!f.equal) {
              text += '\t\t\t' + f.path + ': ' + f.reason + '\n';
            }
          });
        }
      });
    });
  }
  return text;
}

module.exports = {
  run: run,
  resultsToString: resultsToString
};

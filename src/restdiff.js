'use strict';

const async = require('async');
const request = require('request');
const _ = require('lodash');
const compare = require('./compare');
const result = require('./result');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

function run (requests, options, cb) {
  let allOptions = _.assign({
    async: true,
    output: null
  }, options);

  if (allOptions.async) {
    runAsync(requests, allOptions, getOutputToFolderCallBack(allOptions, cb));
  } else {
    runSync(requests, allOptions, getOutputToFolderCallBack(allOptions, cb));
  }
}

function runSync (requests, options, cb) {
  async.mapSeries(requests, compareRequestsSync, cb);
}

function runAsync (requests, options, cb) {
  async.map(requests, compareRequestsAsync, cb);
}

function compareRequestsSync (req, cb) {
  async.series(getRequestArray(req), function (err, results) {
    if (err) {
      cb(err);
    } else {
      cb(null, compareRequests(results));
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
    result[req.type] = {
      name: req.name,
      statusCode: req.response && req.response.statusCode,
      body: req.body,
      compared: {}
    };
    for (let i = 0; i < arr.length; i++) {
      if (i !== index) {
        if (result[arr[i].type]) {
          result[req.type].compared[arr[i].type] = result[arr[i].type].compared[req.type];
        } else {
          result[req.type].compared[arr[i].type] = compareTwoRequests(req, arr[i]);
        }
      }
    }
    return result;
  }, {});
}

function getOutputToFolderCallBack (options, cb) {
  return function outputToFolder (err, results) {
    if (err) {
      cb(err);
    } else {
      if (options.output) {
        async.map(results, getOutputFilesFunction(options), function () {
          if (err) {
            cb(err);
          } else {
            cb(null, results);
          }
        });
      } else {
        cb(null, results);
      }
    }
  };
}

function getOutputFilesFunction (options) {
  return function handleFileOutputs (result, cb) {
    async.map(Object.keys(result), getWriteOutputFunction(options, result), cb);
  };
}

function getWriteOutputFunction (options, result) {
  return function writeOutput (key, cb) {
    let fullpath = path.join(options.output, key, result[key].name + '.json');
    mkdirp(path.dirname(fullpath), function (err) {
      if (err) {
        cb(err);
      } else {
        fs.writeFile(fullpath, result[key].body, 'utf8', cb);
      }
    });
  };
}

function compareTwoRequests (testReq, compareReq) {
  try {
    if (testReq.response.statusCode !== compareReq.response.statusCode) {
      return result.getFailedResult('Status codes where different.');
    }

    // If both are undefined, null, or empty string then they are equal
    if (!testReq.body && !compareReq.body) {
      return result.empty;
    }

    return compare.isEqual(JSON.parse(testReq.body), JSON.parse(compareReq.body));
  } catch (err) {
    return result.getFailedResult('Exception will comparing: ' + err.toString());
  }
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
    cb(null, {
      name: name,
      type: type,
      error: error,
      response: response,
      body: body
    });
  };
}

module.exports = {
  run: run
};

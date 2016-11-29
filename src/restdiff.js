'use strict';

const async = require('async');
const request = require('request');
const _ = require('lodash');
const compare = require('./compare');

function run (requests, options, cb) {
  let allOptions = _.assign({
    async: true
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

function compareTwoRequests (testReq, compareReq) {
  if (testReq.response.statusCode !== compareReq.response.statusCode) return false;

  // If both are undefined, null, or empty string then they are equal
  if (!testReq.body && !compareReq.body) return true;

  return compare.isEqual(JSON.parse(testReq.body), JSON.parse(compareReq.body));
}

function getRequestArray (req) {
  return Object.keys(req).map(function (key) {
    return function (cb) {
      request(req[key], handleRequest(key, cb));
    };
  });
}

function handleRequest (type, cb) {
  return function (error, response, body) {
    cb(null, {
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

/* global describe, it */
'use strict';

const expect = require('expect');
const restdiff = require('../src/restdiff');
const http = require('http');
const fs = require('fs');
const path = require('path');
const result = require('../src/result');

// Configure our HTTP server to use in tests
var server = http.createServer(function (request, response) {
  getFileJson(request, function (err, data) {
    if (err) {
      response.writeHead(404, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({error: err}));
    } else {
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(data);
    }
  });
});
server.listen(9000);

function getFileJson (request, cb) {
  fs.readFile(path.join('test', 'testResponses', request.url.toLowerCase(), request.method.toLowerCase() + '.json'), 'utf8', cb);
}

describe('RestDiff', function () {
  describe('Run', function () {
    it('can run single request three way test async', function (done) {
      restdiff.run([
        {
          name: 'threeWayAsyncMatchTest',
          requests: {
            local: {
              uri: 'http://localhost:9000/testdata'
            },
            dev: {
              uri: 'http://localhost:9000/testdata'
            },
            production: {
              uri: 'http://localhost:9000/testdata'
            }
          }
        }
      ], null, function (err, results) {
        expect(err).toEqual(null);
        expect(result.match(results[0].local.compared.dev)).toEqual(true);
        expect(result.match(results[0].local.compared.production)).toEqual(true);
        expect(err).toNotExist();
        done();
      });
    });

    it('can run single request three way test sync', function (done) {
      restdiff.run([
        {
          name: 'threeWaySyncMatchTest',
          requests: {
            local: {
              uri: 'http://localhost:9000/testdata'
            },
            dev: {
              uri: 'http://localhost:9000/testdata'
            },
            production: {
              uri: 'http://localhost:9000/testdata'
            }
          }
        }
      ], { async: false }, function (err, results) {
        expect(err).toEqual(null);
        expect(result.match(results[0].local.compared.dev)).toEqual(true);
        expect(result.match(results[0].local.compared.production)).toEqual(true);
        done();
      });
    });

    it('can run single request async not matching', function (done) {
      restdiff.run([
        {
          name: 'dontMatchTest',
          requests: {
            local: {
              uri: 'http://localhost:9000/testdata'
            },
            production: {
              uri: 'http://localhost:9000/testdata2'
            }
          }
        }
      ], null, function (err, results) {
        expect(err).toEqual(null);
        expect(result.match(results[0].local.compared.production)).toEqual(false);
        done();
      });
    });

    it('if both return empty string they match', function (done) {
      restdiff.run([
        {
          name: 'emptystringTest',
          requests: {
            local: {
              uri: 'http://localhost:9000/emptystring'
            },
            production: {
              uri: 'http://localhost:9000/emptystring'
            }
          }
        }
      ], null, function (err, results) {
        expect(err).toEqual(null);
        expect(result.match(results[0].local.compared.production)).toEqual(true);
        done();
      });
    });

    it('if response has invalid json mark match false and give error in findings', function (done) {
      restdiff.run([
        {
          name: 'invalidTest',
          requests: {
            local: {
              uri: 'http://localhost:9000/invalid'
            },
            production: {
              uri: 'http://localhost:9000/invalid'
            }
          }
        }
      ], null, function (err, results) {
        expect(err).toEqual(null);
        expect(result.match(results[0].local.compared.production)).toEqual(false);
        done();
      });
    });
  });
});

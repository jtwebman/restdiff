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

describe.skip('RestDiff', function () {
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

  describe('WriteResults', function () {
    it('Writes nothing if results is empty', function () {
      expect(restdiff.resultsToString([])).toEqual('');
    });

    it('Writes passed for each passed result', function () {
      expect(restdiff.resultsToString([
        {
          name: 'test1',
          requests: {
            local: {
              compared: {
                prod: []
              }
            },
            prod: {
              compared: {
                local: []
              }
            }
          }
        }
      ])).toEqual('test1: Passed\n');
    });

    it('Writes failed for each failed result', function () {
      expect(restdiff.resultsToString([
        {
          name: 'test1',
          requests: {
            local: {
              compared: {
                prod: [
                  { path: '/', equal: false, reason: 'Not all keys are equal' },
                  { path: '/report', equal: false, reason: 'Not all keys are equal' },
                  { path: '/report/name', equal: false, reason: 'Not equal' }
                ]
              }
            },
            prod: {
              compared: {
                local: [
                  { path: '/', equal: false, reason: 'Not all keys are equal' },
                  { path: '/report', equal: false, reason: 'Not all keys are equal' },
                  { path: '/report/name', equal: false, reason: 'Not equal' }
                ]
              }
            }
          }
        }
      ])).toEqual('test1: Failed!\n' +
        '\tlocal:\n' +
        '\t\tprod: Failed\n' +
        '\t\t\t/: Not all keys are equal\n' +
        '\t\t\t/report: Not all keys are equal\n' +
        '\t\t\t/report/name: Not equal\n' +
        '\tprod:\n' +
        '\t\tlocal: Failed\n' +
        '\t\t\t/: Not all keys are equal\n' +
        '\t\t\t/report: Not all keys are equal\n' +
        '\t\t\t/report/name: Not equal\n' +
        '');
    });
  });
});

/* global describe, it */
'use strict';

const expect = require('expect');
const restdiff = require('../src/restdiff');
const http = require('http');
const fs = require('fs');
const path = require('path');

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
          compare2: {
            uri: 'http://localhost:9000/testdata'
          },
          compare: {
            uri: 'http://localhost:9000/testdata'
          },
          test: {
            uri: 'http://localhost:9000/testdata'
          }
        }
      ], null, function (err, results) {
        expect(err).toEqual(null);
        expect(results[0].test.compared.compare).toEqual(true);
        expect(results[0].test.compared.compare2).toEqual(true);
        expect(err).toNotExist();
        done();
      });
    });

    it('can run single request three way test sync', function (done) {
      restdiff.run([
        {
          compare2: {
            uri: 'http://localhost:9000/testdata'
          },
          compare: {
            uri: 'http://localhost:9000/testdata'
          },
          test: {
            uri: 'http://localhost:9000/testdata'
          }
        }
      ], { async: false }, function (err, results) {
        expect(err).toEqual(null);
        expect(results[0].test.compared.compare).toEqual(true);
        expect(results[0].test.compared.compare2).toEqual(true);
        expect(err).toNotExist();
        done();
      });
    });

    it('can run single request async not matching', function (done) {
      restdiff.run([
        {
          compare: {
            method: 'PUT',
            uri: 'http://localhost:9000/testdata'
          },
          test: {
            uri: 'http://localhost:9000/testdata2'
          }
        }
      ], { async: false }, function (err, results) {
        expect(err).toEqual(null);
        expect(results[0].test.compared.compare.filter(f => f.equal).length).toBeGreaterThan(0);
        done();
      });
    });
  });
});

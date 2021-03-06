/* global describe, it */
'use strict';

const expect = require('expect');
const compare = require('../src/compare');
const result = require('../src/result');

describe('Compare', function () {
  describe('Nulls', function () {
    it('compare two nulls equal', function () {
      expect(result.match(compare.isEqual(null, null))).toEqual(true);
    });
  });

  describe('Numbers', function () {
    it('compare two integers equal', function () {
      expect(result.match(compare.isEqual(1, 1))).toEqual(true);
    });

    it('compare two floats equal', function () {
      expect(result.match(compare.isEqual(3.2, 3.20))).toEqual(true);
    });

    it('compare two integers not equal', function () {
      expect(result.match(compare.isEqual(1, -1))).toEqual(false);
    });

    it('compare two floats not equal', function () {
      expect(result.match(compare.isEqual(3.2, 3.1999))).toEqual(false);
    });

    it('compare two number to null not equal', function () {
      expect(result.match(compare.isEqual(1, null))).toEqual(false);
    });

    it('compare two number to undefined not equal', function () {
      expect(result.match(compare.isEqual(1, undefined))).toEqual(false);
    });
  });

  describe('Strings', function () {
    it('compare two strings equal', function () {
      expect(result.match(compare.isEqual('abc', 'abc'))).toEqual(true);
    });

    it('compare two numbers not equal', function () {
      expect(result.match(compare.isEqual('abc', '123'))).toEqual(false);
    });
  });

  describe('Boolean', function () {
    it('compare two trues equal', function () {
      expect(result.match(compare.isEqual(true, true))).toEqual(true);
    });

    it('compare two falses equal', function () {
      expect(result.match(compare.isEqual(false, false))).toEqual(true);
    });

    it('compare true and false not equal', function () {
      expect(result.match(compare.isEqual(true, false))).toEqual(false);
    });
  });

  describe('Objects', function () {
    it('compare two empty objects equal', function () {
      expect(result.match(compare.isEqual({}, {}))).toEqual(true);
    });

    it('compare two objects with properties equal', function () {
      expect(result.match(compare.isEqual({
        name: 'Test1',
        score: 217372,
        ratio: 1.4532,
        deleted: false,
        children: [
          'Taylor'
        ],
        status: {
          valid: true
        }
      }, {
        name: 'Test1',
        score: 217372,
        ratio: 1.4532,
        deleted: false,
        children: [
          'Taylor'
        ],
        status: {
          valid: true
        }
      }))).toEqual(true);
    });

    it('compare two objects with properties not equal and shows down the tree', function () {
      let results = compare.isEqual({
        name: 'Test1',
        score: 217372,
        ratio: 1.4532,
        deleted: false,
        children: [
          'Taylor'
        ],
        status: {
          valid: true
        }
      }, {
        name: 'Test1',
        score: 217372,
        ratio: 1.4532,
        deleted: false,
        children: [
          'Taylor'
        ],
        status: {
          valid: false
        }
      });

      expect(result.match(results)).toEqual(false);
      expect(results.filter(f => !f.equal && f.path === '/')[0].equal).toEqual(false);
      expect(results.filter(f => !f.equal && f.path === '/status/')[0].equal).toEqual(false);
      expect(results.filter(f => !f.equal && f.path === '/status/valid/')[0].equal).toEqual(false);
    });
  });

  describe('Arrays', function () {
    it('compare two empty arrays equal', function () {
      expect(result.match(compare.isEqual([], []))).toEqual(true);
    });

    it('compare two arrays equal', function () {
      expect(result.match(compare.isEqual(['test1', 'test2'], ['test1', 'test2']))).toEqual(true);
    });

    it('compare two arrays different order equal', function () {
      expect(result.match(compare.isEqual(['test2', 'test1'], ['test1', 'test2']))).toEqual(true);
    });

    it('compare two arrays different number not equal', function () {
      let results = compare.isEqual(['test1', 'test2'], ['test1', 'test2', 'test3']);
      expect(results.length).toEqual(2);
      expect(results.filter(f => f.value1 === 'test3')[0].equal).toEqual(false);
    });

    it('compare two arrays different number not equal on both sides', function () {
      let results = compare.isEqual(['test1', 'test4'], ['test1', 'test2', 'test3']);
      expect(results.length).toEqual(4);
      expect(results.filter(f => f.value1 === 'test2')[0].equal).toEqual(false);
      expect(results.filter(f => f.value1 === 'test3')[0].equal).toEqual(false);
      expect(results.filter(f => f.value1 === 'test4')[0].equal).toEqual(false);
    });

    it('compare two arrays not equal but same number', function () {
      let results = compare.isEqual(['test1', 'test3'], ['test1', 'test2']);
      expect(results.length).toEqual(3);
      expect(results.filter(f => f.value1 === 'test2')[0].equal).toEqual(false);
      expect(results.filter(f => f.value1 === 'test3')[0].equal).toEqual(false);
    });
  });
});

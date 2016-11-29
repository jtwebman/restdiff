/* global describe, it */
'use strict';

const expect = require('expect');
const compare = require('../src/compare');
const _ = require('lodash');

describe.only('Compare', function () {
  describe('Nulls', function () {
    it('compare two nulls equal', function () {
      expect(compare.isEqual(null, null)[0].equal).toEqual(true);
    });
  });

  describe('Numbers', function () {
    it('compare two integers equal', function () {
      expect(compare.isEqual(1, 1)[0].equal).toEqual(true);
    });

    it('compare two floats equal', function () {
      expect(compare.isEqual(3.2, 3.20)[0].equal).toEqual(true);
    });

    it('compare two integers not equal', function () {
      expect(compare.isEqual(1, -1)[0].equal).toEqual(false);
    });

    it('compare two floats not equal', function () {
      expect(compare.isEqual(3.2, 3.1999)[0].equal).toEqual(false);
    });

    it('compare two number to null not equal', function () {
      expect(compare.isEqual(1, null)[0].equal).toEqual(false);
    });

    it('compare two number to undefined not equal', function () {
      expect(compare.isEqual(1, undefined)[0].equal).toEqual(false);
    });
  });

  describe('Strings', function () {
    it('compare two strings equal', function () {
      expect(compare.isEqual('abc', 'abc')[0].equal).toEqual(true);
    });

    it('compare two numbers not equal', function () {
      expect(compare.isEqual('abc', '123')[0].equal).toEqual(false);
    });
  });

  describe('Boolean', function () {
    it('compare two trues equal', function () {
      expect(compare.isEqual(true, true)[0].equal).toEqual(true);
    });

    it('compare two falses equal', function () {
      expect(compare.isEqual(false, false)[0].equal).toEqual(true);
    });

    it('compare true and false not equal', function () {
      expect(compare.isEqual(true, false)[0].equal).toEqual(false);
    });
  });

  describe('Objects', function () {
    it('compare two empty objects equal', function () {
      expect(compare.isEqual({}, {})[0].equal).toEqual(true);
    });

    it('compare two objects with properties equal', function () {
      expect(_.some(compare.isEqual({
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
      }), f => !f.equal)).toEqual(false);
    });

    it('compare two objects with properties not equal and shows down the tree', function () {
      let findings = compare.isEqual({
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

      expect(_.some(findings, f => !f.equal)).toEqual(true);
      expect(findings.filter(f => !f.equal && f.path === '/')[0].equal).toEqual(false);
      expect(findings.filter(f => !f.equal && f.path === '/status/')[0].equal).toEqual(false);
      expect(findings.filter(f => !f.equal && f.path === '/status/valid/')[0].equal).toEqual(false);
    });
  });

  describe('Arrays', function () {
    it('compare two empty arrays equal', function () {
      expect(compare.isEqual([], [])[0].equal).toEqual(true);
    });

    it('compare two arrays equal', function () {
      expect(compare.isEqual(['test1', 'test2'], ['test1', 'test2'])[0].equal).toEqual(true);
    });

    it('compare two arrays different order equal', function () {
      expect(compare.isEqual(['test2', 'test1'], ['test1', 'test2'])[0].equal).toEqual(true);
    });

    it('compare two arrays different number not equal', function () {
      let findings = compare.isEqual(['test1', 'test2'], ['test1', 'test2', 'test3']);
      expect(findings.length).toEqual(2);
      expect(findings.filter(f => f.value === 'test3')[0].equal).toEqual(false);
    });

    it('compare two arrays different number not equal on both sides', function () {
      let findings = compare.isEqual(['test1', 'test4'], ['test1', 'test2', 'test3']);
      expect(findings.length).toEqual(4);
      expect(findings.filter(f => f.value === 'test2')[0].equal).toEqual(false);
      expect(findings.filter(f => f.value === 'test3')[0].equal).toEqual(false);
      expect(findings.filter(f => f.value === 'test4')[0].equal).toEqual(false);
    });

    it('compare two arrays not equal but same number', function () {
      let findings = compare.isEqual(['test1', 'test3'], ['test1', 'test2']);
      expect(findings.length).toEqual(3);
      expect(findings.filter(f => f.value === 'test2')[0].equal).toEqual(false);
      expect(findings.filter(f => f.value === 'test3')[0].equal).toEqual(false);
    });
  });
});

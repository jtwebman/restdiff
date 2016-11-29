/* global describe, it */
'use strict';

const expect = require('expect');
const compare = require('../src/compare');

describe('Compare', function () {
  describe('Nulls', function () {
    it('compare two nulls equal', function () {
      expect(compare.isEqual(null, null)).toEqual(true);
    });
  });

  describe('Numbers', function () {
    it('compare two integers equal', function () {
      expect(compare.isEqual(1, 1)).toEqual(true);
    });

    it('compare two floats equal', function () {
      expect(compare.isEqual(3.2, 3.20)).toEqual(true);
    });

    it('compare two integers not equal', function () {
      expect(compare.isEqual(1, -1)).toEqual(false);
    });

    it('compare two floats not equal', function () {
      expect(compare.isEqual(3.2, 3.1999)).toEqual(false);
    });

    it('compare two number to null not equal', function () {
      expect(compare.isEqual(1, null)).toEqual(false);
    });

    it('compare two number to undefined not equal', function () {
      expect(compare.isEqual(1, undefined)).toEqual(false);
    });
  });

  describe('Strings', function () {
    it('compare two strings equal', function () {
      expect(compare.isEqual('abc', 'abc')).toEqual(true);
    });

    it('compare two numbers not equal', function () {
      expect(compare.isEqual('abc', '123')).toEqual(false);
    });
  });

  describe('Boolean', function () {
    it('compare two trues equal', function () {
      expect(compare.isEqual(true, true)).toEqual(true);
    });

    it('compare two falses equal', function () {
      expect(compare.isEqual(false, false)).toEqual(true);
    });

    it('compare true and false not equal', function () {
      expect(compare.isEqual(true, false)).toEqual(false);
    });
  });

  describe('Objects', function () {
    it('compare two empty objects equal', function () {
      expect(compare.isEqual({}, {})).toEqual(true);
    });

    it('compare two objects with properties equal', function () {
      expect(compare.isEqual({
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
      })).toEqual(true);
    });

    it('compare two objects with properties not equal', function () {
      expect(compare.isEqual({
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
      })).toEqual(false);
    });
  });

  describe('Arrays', function () {
    it('compare two empty arrays equal', function () {
      expect(compare.isEqual([], [])).toEqual(true);
    });

    it('compare two arrays equal', function () {
      expect(compare.isEqual(['test1', 'test2'], ['test1', 'test2'])).toEqual(true);
    });

    it('compare two arrays different order equal', function () {
      expect(compare.isEqual(['test2', 'test1'], ['test1', 'test2'])).toEqual(true);
    });

    it('compare two arrays different number not equal', function () {
      expect(compare.isEqual(['test1', 'test2'], ['test1', 'test2', 'test3'])).toEqual(false);
    });

    it('compare two arrays same number not equal', function () {
      expect(compare.isEqual(['test1', 'test3'], ['test1', 'test2'])).toEqual(false);
    });
  });
});

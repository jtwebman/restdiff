/* global describe, it */
'use strict';

const expect = require('expect');
const jsonType = require('../src/jsonType');

function testFunc () { return true; }

describe('JsonType', function () {
  describe('getType', function () {
    it('can get type of undefined correctly', function () {
      expect(jsonType.getType(undefined)).toEqual('undefined');
    });

    it('can get type of null correctly', function () {
      expect(jsonType.getType(null)).toEqual('null');
    });

    it('can get type of boolean correctly', function () {
      expect(jsonType.getType(true)).toEqual('boolean');
    });

    it('can get type of number correctly with integer', function () {
      expect(jsonType.getType(1)).toEqual('number');
    });

    it('can get type of number correctly with float', function () {
      expect(jsonType.getType(3.123123)).toEqual('number');
    });

    it('can get type of NaN correctly', function () {
      expect(jsonType.getType(Number.NaN)).toEqual('nan');
    });

    it('can get type of positive infinity correctly', function () {
      expect(jsonType.getType(Number.POSITIVE_INFINITY)).toEqual('infinite');
    });

    it('can get type of negative infinity correctly', function () {
      expect(jsonType.getType(Number.NEGATIVE_INFINITY)).toEqual('infinite');
    });

    it('can get type of string correctly', function () {
      expect(jsonType.getType('')).toEqual('string');
    });

    it('can get type of array correctly', function () {
      expect(jsonType.getType([])).toEqual('array');
    });

    it('can get type of object correctly', function () {
      expect(jsonType.getType({})).toEqual('object');
    });

    it('can get type of symbol correctly', function () {
      expect(jsonType.getType(Symbol())).toEqual('symbol');
    });

    it('can get type of function correctly', function () {
      expect(jsonType.getType(testFunc)).toEqual('function');
    });
  });

  describe('getPrecedence', function () {
    it('can get precedence for null correctly', function () {
      expect(jsonType.getPrecedence('null')).toEqual(1);
    });

    it('can get precedence for boolean correctly', function () {
      expect(jsonType.getPrecedence('boolean')).toEqual(2);
    });

    it('can get precedence for number correctly', function () {
      expect(jsonType.getPrecedence('number')).toEqual(3);
    });

    it('can get precedence for string correctly', function () {
      expect(jsonType.getPrecedence('string')).toEqual(4);
    });

    it('can get precedence for object correctly', function () {
      expect(jsonType.getPrecedence('object')).toEqual(5);
    });

    it('can get precedence for array correctly', function () {
      expect(jsonType.getPrecedence('array')).toEqual(6);
    });

    it('can get precedence for undefined correctly', function () {
      expect(jsonType.getPrecedence('undefined')).toEqual(Number.MAX_VALUE);
    });

    it('can get precedence for NaN correctly', function () {
      expect(jsonType.getPrecedence('nan')).toEqual(Number.MAX_VALUE);
    });

    it('can get precedence for infinite correctly', function () {
      expect(jsonType.getPrecedence('infinite')).toEqual(Number.MAX_VALUE);
    });

    it('can get precedence for symbol correctly', function () {
      expect(jsonType.getPrecedence('symbol')).toEqual(Number.MAX_VALUE);
    });

    it('can get of function correctly', function () {
      expect(jsonType.getPrecedence('function')).toEqual(Number.MAX_VALUE);
    });
  });

  describe('compare', function () {
    describe('different types', function () {
      it('comparing different types uses type precedence', function () {
        expect(jsonType.compare(null, [])).toBeLessThan(0);
        expect(jsonType.compare('', -3)).toBeGreaterThan(0);
      });
    });

    describe('null', function () {
      it('comparing null returns 0', function () {
        expect(jsonType.compare(null, null)).toEqual(0);
      });
    });

    describe('boolean', function () {
      it('comparing false to true returns a negitive number', function () {
        expect(jsonType.compare(false, true)).toBeLessThan(0);
      });

      it('comparing true to false returns a positive number', function () {
        expect(jsonType.compare(true, false)).toBeGreaterThan(0);
      });

      it('comparing true returns 0', function () {
        expect(jsonType.compare(true, true)).toEqual(0);
      });

      it('comparing false returns 0', function () {
        expect(jsonType.compare(false, false)).toEqual(0);
      });
    });

    describe('number', function () {
      it('comparing lesser number to greater number returns a negitive number', function () {
        expect(jsonType.compare(1, 2)).toBeLessThan(0);
      });

      it('comparing greater number to lesser number returns a positive number', function () {
        expect(jsonType.compare(1.23213, -32)).toBeGreaterThan(0);
      });

      it('comparing very close numbers still shows greater then', function () {
        expect(jsonType.compare(2, 1.999999999999999)).toBeGreaterThan(0);
      });

      it('comparing equal numbers returns 0', function () {
        expect(jsonType.compare(212312312.1333, 212312312.1333)).toEqual(0);
      });
    });

    describe('string', function () {
      it('comparing lesser string to greater string returns a negitive number', function () {
        expect(jsonType.compare('bbb', 'ccc')).toBeLessThan(0);
      });

      it('comparing greater string to lesser string returns a positive number', function () {
        expect(jsonType.compare('ddd', 'aaa')).toBeGreaterThan(0);
      });

      it('comparing equal string returns 0', function () {
        expect(jsonType.compare('!@$#!@1234213', '!@$#!@1234213')).toEqual(0);
      });
    });

    describe('object', function () {
      it('comparing objects uses property names sorted first', function () {
        expect(jsonType.compare({
          aaa: 0
        }, {
          bbb: 0
        })).toBeLessThan(0);
      });

      it('comparing objects uses values of properties in sorted order if has all the same properties', function () {
        expect(jsonType.compare({
          aaa: 1
        }, {
          aaa: 0
        })).toBeGreaterThan(0);
      });

      it('comparing objects equal returns 0', function () {
        expect(jsonType.compare({
          aaa: 1
        }, {
          aaa: 1
        })).toEqual(0);
      });

      it('comparing objects removes unsupported properties first', function () {
        expect(jsonType.compare({
          aaa: 1,
          bbb: testFunc,
          ccc: Symbol(),
          ddd: Number.NaN,
          eee: Number.POSITIVE_INFINITY,
          fff: Number.NEGATIVE_INFINITY,
          ggg: undefined
        }, {
          aaa: 1
        })).toEqual(0);
      });

      it('comparing nested objects equal returns 0', function () {
        expect(jsonType.compare({
          aaa: {
            bbb: 2
          }
        }, {
          aaa: {
            bbb: 2
          }
        })).toEqual(0);
      });

      it('comparing nested objects uses nested properties to sort', function () {
        expect(jsonType.compare({
          aaa: {
            bbb: 3
          }
        }, {
          aaa: {
            aaa: 2
          }
        })).toBeGreaterThan(0);
      });

      it('comparing nested objects uses nested values if properties match', function () {
        expect(jsonType.compare({
          aaa: {
            bbb: 3
          }
        }, {
          aaa: {
            bbb: 2
          }
        })).toBeGreaterThan(0);
      });
    });

    describe('array', function () {
      it('comparing arrays uses lengths first', function () {
        expect(jsonType.compare([1, 2], [1])).toBeGreaterThan(0);
      });

      it('comparing arrays uses values if same length', function () {
        expect(jsonType.compare([1, 3], [1, 2])).toBeGreaterThan(0);
      });

      it('comparing arrays removes unsupported properties first', function () {
        expect(jsonType.compare([
          1,
          testFunc,
          Symbol(),
          Number.NaN,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          undefined
        ], [
          1
        ])).toEqual(0);
      });

      it('comparing arrays uses typeof values if same length but different types', function () {
        expect(jsonType.compare([1, ''], [1, false])).toBeGreaterThan(0);
      });
    });
  });

  describe('compareType', function () {
    it('expect lesser type compareed to greater type to returns a negitive number', function () {
      expect(jsonType.compareType('null', 'array')).toBeLessThan(0);
    });

    it('expect greater type compareed to greater type to returns a positive number', function () {
      expect(jsonType.compareType('string', 'number')).toBeGreaterThan(0);
    });

    it('expect equal types compareed to return 0', function () {
      expect(jsonType.compareType('object', 'object')).toEqual(0);
    });
  });

  describe('sort', function () {
    describe('Objects', function () {
      it('sort can sort property names correctly', function () {
        expect(Object.keys(jsonType.sort({
          bbb: 0,
          ccc: 0,
          aaa: 0,
          '_dd': 0,
          '  e': 0
        }))).toEqual([
          '  e',
          '_dd',
          'aaa',
          'bbb',
          'ccc'
        ]);
      });
    });

    describe('Arrays', function () {
      it('can sort array of strings correctly', function () {
        expect(jsonType.sort([
          '%23',
          'dfs',
          'zsd',
          '   '
        ])).toEqual([
          '   ',
          '%23',
          'dfs',
          'zsd'
        ]);
      });

      it('make sure we sort on types the same and remove invalid json values', function () {
        expect(jsonType.sort([
          {},
          [],
          undefined,
          null,
          true,
          2.3,
          '',
          NaN,
          testFunc,
          Symbol(),
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY
        ])).toEqual([
          null,
          true,
          2.3,
          '',
          {},
          []
        ]);
      });
    });
  });
});

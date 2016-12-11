/* global describe, it */
'use strict';

const expect = require('expect');
const jsonDiff = require('../src/jsonDiff');
const result = require('../src/result');
const _ = require('lodash');

describe.only('JsonDiff', function () {
  describe('diff', function () {
    it('can diff two empty objcts and they match', function () {
      expect(result.match(jsonDiff.diff({}, {}))).toEqual(true);
    });

    it('can diff two empty arrays and they match', function () {
      expect(result.match(jsonDiff.diff([], []))).toEqual(true);
    });

    it('can diff empty array and empty object and they dont match', function () {
      expect(jsonDiff.diff([], {})).toEqual(true);
    });

    it('can diff two complex objects that match', function () {
      expect(result.match(jsonDiff.diff({
        data: [
          {
            name: 'test1',
            value: 1
          },
          {
            name: 'test2',
            value: 2
          },
          {
            name: 'test3',
            value: 3
          }
        ],
        abc: 'ok'
      }, {
        data: [
          {
            name: 'test1',
            value: 1
          },
          {
            name: 'test2',
            value: 2
          },
          {
            name: 'test3',
            value: 3
          }
        ],
        abc: 'ok'
      }))).toEqual(true);
    });

    it('can diff two deep objects that match without stack overflow', function () {
      let deepObj = _.range(10000).reduce((obj, i) => {
        let ref = obj;
        for (let j = 0; j < i; j++) {
          ref = ref.next;
        }
        ref.index = i;
        ref.next = {};
        return obj;
      }, {});
      let deepObj2 = _.range(10000).reduce((obj, i) => {
        let ref = obj;
        for (let j = 0; j < i; j++) {
          ref = ref.next;
        }
        ref.index = i;
        ref.next = {};
        return obj;
      }, {});
      expect(result.match(jsonDiff.diff(deepObj, deepObj2))).toEqual(true);
    });

    it('can diff two deep objects that dont match without stack overflow', function () {
      let lastObj, lastObj2;
      let deepObj = _.range(10000).reduce((obj, i) => {
        let ref = obj;
        for (let j = 0; j < i; j++) {
          ref = ref.next;
        }
        ref.index = i;
        lastObj = {};
        ref.next = lastObj;
        return obj;
      }, {});
      lastObj.test = 1; // Make last item very deep different
      let deepObj2 = _.range(10000).reduce((obj, i) => {
        let ref = obj;
        for (let j = 0; j < i; j++) {
          ref = ref.next;
        }
        ref.index = i;
        lastObj2 = {};
        ref.next = lastObj2;
        return obj;
      }, {});
      lastObj2.test = 2; // Make last item very deep different
      console.log('match: ', lastObj.test === lastObj2.test);
      expect(result.match(jsonDiff.diff(deepObj, deepObj2))).toEqual(true);
    });
  });
});

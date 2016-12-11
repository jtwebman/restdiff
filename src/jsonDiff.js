'use strict';

const _ = require('lodash');
const jsonType = require('./jsonType');
const result = require('./result');

function diff (base, compare) {
  return compareValue([{
    path: '/',
    base: jsonType.sort(base),
    compare: jsonType.sort(compare)
  }]);
}

function compareValue (work) {
  let results = result.empty;

  while (work.length > 0) { // To stop recursion
    let current = work.pop();

    let basetype = jsonType.getType(current.base);
    let comparetype = jsonType.getType(current.compare);

    if (basetype !== comparetype) {
      results = result.getFailed(results, current.path, 'Base is type ' + basetype +
      ' but the compare type is ' + comparetype + '.');
      continue;
    }

    if (current.base === current.compare) {
      results = result.addMatch(results, current.path);
    } else {
      if (basetype === 'array') {
        let compareLength = current.compare.length;
        results = current.base.reduce((results, v, i) => {
          if (i < compareLength) {
            work.push({
              path: current.path + '[' + i + ']',
              base: v,
              compare: current.compare[i]
            });
          } else {
            results = result.getFailed(results, current.path + '[' + i + ']',
            'Base missing a matching record.');
          }
          return results;
        }, results);
        if (current.base.length < compareLength) {
          for (let i = current.base.length; i < compareLength; i++) {
            results = result.getFailed(results, current.path + '[' + i + ']',
            'Compare missing a matching record.');
          }
        }
      }
      if (basetype === 'object') {
        _.union(Object.keys(current.base), Object.keys(current.compare))
        .forEach(key => {
          work.push({
            path: current.path + '/' + key,
            base: current.base[key],
            compare: current.compare[key]
          });
        });
      }
      results = result.getFailed(results, current.path, 'Do not match.');
    }
  }
  return results;
}

module.exports = {
  diff: diff
};

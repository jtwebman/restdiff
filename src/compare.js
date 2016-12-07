'use strict';

const _ = require('lodash');
const result = require('./result');

function isEqual (value1, value2) {
  return isEqualValue('/', value1, value2);
}

function isEqualValue (path, value1, value2) {
  let type = getType(value1);
  if (type !== getType(value2)) {
    return result.getResult(path, false, 'Different types', type, getType(value2));
  }

  if (value1 === value2) {
    return result.getResult(path, true);
  } else {
    if (type === 'array') {
      return isEqualArrayNoOrder(path, value1, value2);
    }
    if (type === 'object') {
      return isEqualObject(path, value1, value2);
    }
    return result.getResult(path, false, 'Not equal', value1, value2);
  }
}

function isEqualObject (path, obj1, obj2) {
  return checkAddSelfFinding(path,
    _.flatten(_.union(Object.keys(obj1), Object.keys(obj2))
      .map(key => isEqualValue(path + key + '/', obj1[key], obj2[key]))
    ),
    'Not all keys are equal');
}

function isEqualArrayNoOrder (path, arr1, arr2) {
  return checkAddSelfFinding(path,
    compareArrays(path, arr1, arr2),
    'Not all elements are equal');
}

function checkAddSelfFinding (path, findings, failReason) {
  if (_.some(findings, f => !f.equal)) {
    return result.combine(result.getResult(path, false, failReason), findings);
  } else {
    return result.combine(result.getResult(path, true), findings);
  }
}

function compareArrays (path, compareArr1, compareArr2) {
  let results = [];
  if (compareArr1.length !== compareArr2.length) {
    results.push({
      path: path,
      equal: false,
      reason: 'Arrays different size'
    });
  } else {
    for (let i = 0; i < compareArr1.length; i++) {
      let found = false;
      for (let j = 0; j < compareArr2.length; j++) {
        let compare = isEqualValue(path, compareArr1[i], compareArr2[j]);
        if (compare[0].equal) {
          found = true;
          break;
        }
      }
      if (!found) {
        results.push({
          path: path + i + '/',
          equal: false,
          reason: 'Value missing',
          value1: compareArr1[i]
        });
      }
    }
  }
  return results;
}

function getType (value) {
  let type = typeof value;
  if (type === 'object') {
    if (Array.isArray(value)) {
      return 'array';
    } else {
      return 'object';
    }
  } else {
    return type;
  }
}

module.exports = {
  isEqual: isEqual
};

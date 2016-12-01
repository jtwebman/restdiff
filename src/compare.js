'use strict';

const _ = require('lodash');
const result = require('./result');

function isEqual (value1, value2) {
  return result.getResults(isEqualValue('/', value1, value2));
}

function isEqualValue (path, value1, value2) {
  let type = getType(value1);
  if (type !== getType(value2)) {
    return [{
      path: path,
      equal: false,
      reason: 'Different types',
      value1: type,
      value2: getType(value2)
    }];
  }

  if (value1 === value2) {
    return [{ path: path, equal: true }];
  } else {
    if (type === 'array') {
      return isEqualArrayNoOrder(path, value1, value2);
    }
    if (type === 'object') {
      return isEqualObject(path, value1, value2);
    }
    return [{
      path: path,
      equal: false,
      reason: 'Not equal',
      value1: value1,
      value2: value2
    }];
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
    _.flatten(_.concat(
      compareArrays(path, arr1, arr2),
      compareArrays(path, arr2, arr1)
    )),
    'Not all elements are equal');
}

function checkAddSelfFinding (path, findings, failReason) {
  if (_.some(findings, f => !f.equal)) {
    findings.unshift({ path: path, equal: false, reason: failReason });
  } else {
    findings.unshift({ path: path, equal: true });
  }
  return findings;
}

function compareArrays (path, compareArr1, compareArr2) {
  return compareArr1.reduce((findings, v1, index, arr) => {
    if (!_.some(compareArr2, v2 => _.some(isEqualValue(path, v1, v2), f => f.equal))) {
      findings.push({
        path: path + index + '/',
        equal: false,
        reason: 'Value missing',
        value: v1
      });
    }
    return findings;
  }, []);
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

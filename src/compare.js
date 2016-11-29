'use strict';

function isEqual (value1, value2) {
  let type = getType(value1);
  if (type !== getType(value2)) {
    return false;
  }

  if (value1 === value2) {
    return true;
  } else {
    if (type === 'array') {
      return isEqualArrayNoOrder(value1, value2);
    }
    if (type === 'object') {
      return isEqualObject(value1, value2);
    }
    return false;
  }
}

function isEqualObject (obj1, obj2) {
  let keys = Object.keys(obj1);

  if (!isEqualArrayNoOrder(keys, Object.keys(obj2))) {
    return false;
  } else {
    for (let i = 0, len = keys.length; i < len; i++) {
      if (!isEqual(obj1[keys[i]], obj2[keys[i]])) {
        return false;
      }
    }
    return true;
  }
}

function isEqualArrayNoOrder (arr1, arr2) {
  let match = 0;
  if (arr1.length !== arr2.length) {
    return false;
  } else {
    for (let i = 0, len = arr1.length; i < len; i++) {
      for (let j = 0; j < len; j++) {
        if (isEqual(arr1[i], arr2[j])) {
          match++;
          break;
        }
      }
    }
    return match === arr1.length;
  }
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

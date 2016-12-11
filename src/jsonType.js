'use strict';

function getType (value) {
  let type = typeof value;
  switch (type) {
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (Array.isArray(value)) {
        return 'array';
      }
      return 'object';
    case 'number':
      if (Number.isNaN(value)) {
        return 'nan';
      }
      if (!Number.isFinite(value)) {
        return 'infinite';
      }
      return 'number';
    default:
      return type;
  }
}

function getPrecedence (type) {
  switch (type) {
    case 'null':
      return 1;
    case 'boolean':
      return 2;
    case 'number':
      return 3;
    case 'string':
      return 4;
    case 'object':
      return 5;
    case 'array':
      return 6;
    default: // undefined, infinite, nan, symbol, function
      // Alwasy at the end as these can't exist in valid JSON
      return Number.MAX_VALUE;
  }
}

function valid (json) {
  return validType(getType(json));
}

function validType (type) {
  switch (type) {
    case 'null':
    case 'boolean':
    case 'number':
    case 'string':
    case 'object':
    case 'array':
      return true;
    default: // undefined, infinite, nan, symbol, function
      return false;
  }
}

function compare (x, y) {
  // Get types and compare. Sort by type precedence if not the same
  let type = getType(x);
  let compare = compareType(type, getType(y));
  if (compare !== 0) {
    return compare;
  }

  // Types match sort values
  switch (type) {
    case 'object':
      return compareObjects(x, y);
    case 'array':
      return compareArrays(x, y);
    case 'null':
      return 0;
    case 'number':
      return x - y;
    case 'boolean':
      if (x === true && y === false) return 1;
      if (x === false && y === true) return -1;
      return 0;
    case 'string':
      return x.localeCompare(y);
    default: // function, symbol, and undefined return nothing
      return 0;
  }
}

function compareObjects (x, y) {
  // Remove unsupprted json type properties before comparing
  let keys = Object.keys(x).filter(k => valid(x[k])).sort();
  let compareKeys = Object.keys(y).filter(k => valid(y[k])).sort();

  // First compare property names sorted
  let check = keys.join('::').localeCompare(compareKeys.join('::'));
  if (check !== 0) {
    return check;
  }

  // Properties were equal now compare values in sorted order
  for (let i = 0, len = keys.length; i < len; i++) {
    check = compare(x[keys[i]], y[keys[i]]);
    if (check !== 0) {
      return check;
    }
  }

  return 0; // Everything is equal
}

function compareArrays (x, y) {
  // remove unsupported types first
  let xArr = x.filter(valid);
  let yArr = y.filter(valid);

  // Compare length first
  let check = xArr.length - yArr.length;
  if (check !== 0) {
    return check;
  }

  // Arrays are the same length compare each value one at a time
  for (let i = 0, len = xArr.length; i < len; i++) {
    check = compare(xArr[i], yArr[i]);
    if (check !== 0) {
      return check;
    }
  }

  return 0;
}

function compareType (x, y) {
  return getPrecedence(x) - getPrecedence(y);
}

function sort (json) {
  return sortJson(json);
}

function sortString (jsonStr) {
  return sortJson(JSON.parse(jsonStr));
}

function sortJson (json) {
  let current;

  let work = [{
    value: json
  }];

  while (work.length > 0) {
    current = work.pop();
    switch (getType(current.value)) {
      case 'object':
        if (!current.new) {
          let keys = Object.keys(current.value)
          .filter(k => valid(current.value[k]))
          .sort().reverse();
          let keysLength = keys.length;
          if (keysLength > 0) {
            let parent = {};
            work.push({ new: parent });
            for (let i = 0; i < keysLength; i++) {
              work.push({
                value: current.value[keys[i]],
                parent: parent,
                parentType: 'object',
                parentKey: keys[i]
              });
            }
            continue;
          } else {
            current.new = {};
          }
        }
        break;
      case 'array':
        if (!current.new) {
          let values = current.value.filter(valid)
          .sort(compare).reverse();
          let valuesLength = values.length;
          if (valuesLength > 0) {
            let parent = [];
            work.push({ new: parent });
            for (let i = 0; i < valuesLength; i++) {
              work.push({
                value: current.value[i],
                parent: parent,
                parentType: 'array'
              });
            }
            continue;
          } else {
            current.new = [];
          }
        }
        break;
      default:
        current.new = current.value;
    }

    if (current.parent) {
      if (current.parentType === 'array') {
        current.parent.push(current.new);
      }
      if (current.parentType === 'object') {
        current.parent[current.parentKey] = current.new;
      }
    } else {
      return current.new;
    }
  }
}

module.exports = {
  getType: getType,
  getPrecedence: getPrecedence,
  valid: valid,
  validType: validType,
  compare: compare,
  compareType: compareType,
  sort: sort,
  sortString: sortString
};

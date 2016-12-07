'use strict';

const _ = require('lodash');

function sort (json, options) {
  let allOptions = _.assign({
    tabs: false,
    number: 2,
    newlines: true
  }, options);

  if (typeof json === 'string') {
    return sortJson(allOptions, 0, '', JSON.parse(json));
  } else {
    return sortJson(allOptions, 0, '', json);
  }
}

function sortJson (options, level, key, json) {
  switch (getType(json)) {
    case 'object':
      return sortJsonObject(options, level, key, json);
    case 'array':
      return sortJsonArray(options, level, key, json);
    case 'null':
      return getKeyString(options, level, key, '"null"');
    case 'number':
      return getKeyString(options, level, key, json.toString());
    case 'boolean':
      if (json) {
        return getKeyString(options, level, key, 'true');
      } else {
        return getKeyString(options, level, key, 'false');
      }
    case 'string':
      return getKeyString(options, level, key, '"' + json + '"');
    default: // function, symbol, and undefined return nothing
      return '';
  }
}

function getKeyString (options, level, key, value) {
  if (key) {
    return getKeyStringSpace(options, level) + '"' + key + '": ' + value;
  } else {
    return getKeyStringSpace(options, level) + value;
  }
}

function getKeyStringSpace (options, level) {
  if (options.newlines) {
    if (options.tabs) {
      return Array((options.number + 1) * level).join('\t');
    } else {
      return Array((options.number + 1) * level).join(' ');
    }
  } else {
    return '';
  }
}

function getKeyStringEnd (options, comma) {
  return (comma ? ',' : '') + (options.newlines ? '\n' : ' ');
}

function sortJsonObject (options, level, key, json) {
  return getKeyString(options, level, key,
  '{' + getKeyStringEnd(options, false) +
  Object.keys(json).sort().map(objKey =>
    sortJson(options, level + 1, objKey, json[objKey])
  ).join(',\n') + '\n' +
  getKeyStringSpace(options, level) + '}');
}

function sortJsonArray (options, level, key, json) {
  return getKeyString(options, level, key,
  '[' + getKeyStringEnd(options, false) +
  json.map(val => sortJson(options, level + 1, '', val)).sort(compareJson)
    .join(',\n') +
  getKeyStringEnd(options, false) +
  getKeyStringSpace(options, level) + ']');
}

function compareJson (x, y) {
  if (getType(x) !== getType(y)) {
    return -1;
  }
  switch (getType(x)) {
    case 'object':
      for (let key in x) {
        let keyCompare = compareJson(x[key], y[key]);
        if (keyCompare !== 0) return keyCompare;
      }
      return 0;
    case 'array':
      return x.length - y.length;
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

function getType (value) {
  if (value === null) {
    return 'null';
  }

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
  sort: sort
};

const USE_WEAK_MAP = true;

/**
 * Untested, but polyfills WeakMap.
 * Works by keeping track of keys and values with two associative arrays
 * The key of said associative array is a Symbol which is the same for a
 * given (key, value)-pair.
 * 
 * @returns {WeakMap}
 */
function factory() {
  const obj = USE_WEAK_MAP ? new WeakMap() : {};
  if (!USE_WEAK_MAP) {
    obj.constructor = factory;
    const keys = {};
    const values = {};
    Object.keys(facadeMixin).forEach(function (method) {
      obj[method] = function (...args) {
        return facadeMixin[method].apply(obj, [keys, values].concat(args));
      };
    });
  }
  return obj;
}

/**
 * Checks if two objects are equal and if everything referenced by them are
 * equal as well.
 * 
 * @param {*} param1 
 * @param {*} param2 
 */
function deepEquals(param1, param2) {
  // Initial check
  if (param1 === param2) {
    return true;
  }

  // Deep check if object
  if (typeof param1 === 'object' && typeof param2 === 'object') {
    const properties1 = Object.getOwnPropertyNames(param1)
      .concat(Object.getOwnPropertySymbols(param1));
    const properties2 = Object.getOwnPropertyNames(param1)
      .concat(Object.getOwnPropertySymbols(param1));
    if (properties1.length !== properties2.length) { return false; }

    // Check have same properties
    let index = -1;
    while (++index < properties1.length) {
      if (properties1[index] !== properties2[index]) {
        return false;
      }
    }

    // Check same values
    for (let prop of properties1) {
      if (!deepEquals(param1[prop], param2[prop])) {
        return false;
      }
    }

    // Must be same
    return true;
  } else {
    return false;
  }
}

/**
 * Gets the unique identifier for an (key, value)-pair
 * In other words, find the index for value based on the key {param1}
 * 
 * @param {object} keys Key list for the WeakMap
 * @param {*} param1 Key that whose symbol we are searching for
 * @returns {Symbol} The unique identifier for a (key, value)-pair
 */
function getKeySymbol(keys, param1) {
  for (let sym of Object.getOwnPropertySymbols(keys)) {
    if (deepEquals(keys[sym], param1)) {
      return { key: sym, found: true };
    }
  }
  return { found: false };
}

// Should do everything that WeakMap.prototype does
const facadeMixin = {
  get: function (keys, values, param1) {
    const keySymbol = getKeySymbol(keys, param1);
    return keySymbol.found ? values[keySymbol.key] : undefined;
  },
  has: function (keys, values, param1) {
    return getKeySymbol(keys, param1).found;
  },
  set: function (keys, values, param1, param2) {
    const keySymbol = getKeySymbol(keys, param1);
    const trueKey = keySymbol.found ? keySymbol.key : Symbol();
    keys[trueKey] = param1; // Doesn't matter if this is set again
    values[trueKey] = param2;
  },
  delete: function (keys, values, param1) {
    const keySymbol = getKeySymbol(keys, param1);
    if (keySymbol.found) {
      delete keys[keySymbol.key];
      delete values[keySymbol.key];
    }
  },
};

module.exports = factory;
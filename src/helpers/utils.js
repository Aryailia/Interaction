const Utils = {
  /**
 * @typedef {object} IteratorProtocol
 * @property {boolean} done
 * @property {*} value the value to return, important for method calls
 */
  /**
   * @param {HTMLElement} self
   * @param {WeakMap} settingsList
   * @param {*} param parameter passed to handler
   * @param {object} defaults default public options
   * @param {object} methods Associate array, key = method name,
   * value = method defintion
   * @returns {object} true if specify options, false if method call
   * @returns {IteratorProtocol} Returns { done: true, value: * } if execution
   * is finished (ie. when a method is called), else { done: false}. Does not
   * simply return boolean since methods might want to return a boolean. Or
   * returns an error when malformed.
   */
  setup: function (self, settingsList, defaults, param, methods) {
    if (!settingsList.has(self)) {
      if (!defaults.hasOwnProperty('publics')) {  // if defaults well-formed
        throw new SyntaxError('Need .publics property in {defaults}');
      }
      settingsList.set(self, Utils.assign({}, defaults, 1)); // Deeper clone
      // Makes sure to copy publics as well
    }
    const options = settingsList.get(self);
    const isBlank = param == null; // True if null/undefined

    // Control program flow based on type of {param}
    switch (typeof param) {
      case 'string': // Execute method
        if (methods.hasOwnProperty(param)) {
          throw new SyntaxError(`'${param}' is an invalid method`);
        } else {
          return { done: true, value: methods[param](options) };
        }
        
      case 'object': // Proceed with normal setup
        options.publics = Utils.defaults(options.publics, isBlank ? {} : param);
        return { done: false};

      default: // Nothing or wrong type
        if (isBlank) { // This is the base case
          return { done: false };
        } else { // Wrong type
          throw new SyntaxError('pass nothing, an object, or a string');
        }
    }
  },

  defaults: function (template, source) {
    const obj = Utils.assign({}, template); // Clone template
    Object.keys(source).forEach(function (key) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = source[key];
      } else {
        throw new SyntaxError('defaults - \'' + key + '\' invalid key');
      }
    });
    return obj;
  },
  /**
   * Deep assign for enumerable properties only
   */
  assign: function (target, source, depth) {
    var properties = Object.keys(source);
    var isDeeperCopy = depth != undefined && depth > 0;
    var index = -1;
    var prop, temp;

    while (++index < properties.length) {
      prop = properties[index];
      temp = source[prop]; // temp != null tests both undefined and null
      target[prop] = temp != null && typeof temp === 'object'
        ? (isDeeperCopy // Invoke constructor if possible children
          ? Utils.assign(temp.constructor(), temp, depth - 1) // clone
          : temp.constructor()) // Do not clone children
        : temp;
    }
    return target;
  },

  /**
   * Returns true if it is a DOM node
   * @author https://stackoverflow.com/questions/384286/
   * @param {*} toTest
   * @returns {boolean}
   */
  isNode: function (toTest) {
    return(typeof Node === 'object'
      ? toTest instanceof Node
      : toTest && typeof toTest === 'object' && typeof toTest.nodeType === 'number'
        && typeof toTest.nodeName === 'string'
    );
  },

  /**
   * Returns true if it is a DOM element
   * @author https://stackoverflow.com/questions/384286/
   * @param {*} toTest
   * @returns {boolean}
   */
  isElement: function (toTest) {
    return(typeof HTMLElement === 'object'
      ? toTest instanceof HTMLElement
      //DOM2
      : toTest && typeof toTest === 'object' && toTest !== null
        && toTest.nodeType === 1 && typeof toTest.nodeName==='string'
    );
  },
};

module.exports = Utils;
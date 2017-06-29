/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_RESULT__;// UMD returnExports.js adapated with Lodash module stuff (I don't really know what I'm doing though)
(function (factory) {
  // Detect free variable `global` from Node.js.
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
  // Detect free variable `self`.
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
  // Used as a reference to the global object.
  var root = freeGlobal || freeSelf || Function('return this')();
  
  if (true) {
    // AMD. Register as an anonymous module.
    root.Interactable = factory(root);
    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return factory(root);
    }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof module === 'object' && typeof module === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(root);
    exports['Interactable'] = factory(root);
  } else {
    // Browser globals (root is window)
    root.Interactable = factory(root);
  }
}.call(this, function (root) {
  const WeakMapFacade = __webpack_require__(11);

  const Mouse = __webpack_require__(10);
  const draggable =    __webpack_require__(2);
  const resizeable =   __webpack_require__(3);
  const selectable =   __webpack_require__(4);
  const sortable =     __webpack_require__(5);
  const takedropable = __webpack_require__(6);

  const globalEvents = {
    mousemove: new Set(),
  };
  const drag = new WeakMap();
  const resize = new WeakSet();
  const select = new WeakSet();
  const sort = new WeakSet();
  const takedrop = new WeakSet();
  const activeDraggables = new Set();

  function _bind(fn, element) {
    const that = this;
    return function (...args) {
      fn.apply(null, [element].concat(args));
      return that;
    };
  }

  return function (element) {
    const state = {
      self: element,
      document: root.document,
      mouse: Mouse,
      use_waapi: true,

      globalEvents: globalEvents,
      activeDraggables: activeDraggables,
      drag:     drag,
      resize:   resize,
      select:   select,
      sort:     sort,
      takedrop: takedrop,
    };

    return {
      draggable:    _bind(draggable.draggable, state),
      resizeable:   _bind(resizeable, state),
      selectable:   _bind(selectable, state),
      sortable:     _bind(sortable, state),
      takedropable: _bind(takedropable, state),
    };
  };
}));
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Utils = __webpack_require__(9);
const EventStream = __webpack_require__(12);
const mouse = __webpack_require__(10);

const defaults = {
  handle: null,
  use_waapi: false,
  throttle: 100,
};

const methods = {
  destroy: function () {},
};

function draggable(state, param) {
  try {
    if (!Utils.setup(state.self, state.drag, param, defaults, methods)) {
      return; // Do nothing if method call
    }
  } catch(err) {
    throw new Error( `draggable\n${err}`);
  }

  const self = state.self;
  const options = state.drag.get(self);
  const publics = options.publics;
  self.style.position = 'absolute';
  options.mouse = mouse;

  // More defaults, and variable setting of {options}
  options.self = self;
  const handle = Utils.defaultAssign(publics, 'handle', self);
  if (publics.use_waapi) {
    options.anime = new Animation();
  }
  
  // Event Listening
  options.stop = wrap(state, options, stop);
  options.move = EventStream.flow(
    [wrap, state, options],
    [EventStream.throttle, options.publics.throttle]
  )(move);
  handle.addEventListener('mousedown', wrap(state, options, start));
}

function wrap(state, options, fn) {
  return function (ev) {
    return fn(state, options, ev);
  };
}

function start(state, options, ev) {
  //const target = _findMarkedParent(_draggableList, e.target);
  const self = ev.currentTarget;
  const mouse = options.mouse;

  mouse.setBounds(ev, self, self.parentNode);
  [mouse.startX, mouse.startY] = [ev.pageX, ev.pageY];

  // Add more event listeners
  options.unsub = EventStream.subscribe(state.document, 'mousemove', options.move);
  state.document.addEventListener('mouseup', options.stop);
}

function updateMouse(ev, mouse) {
  [mouse.x0, mouse.y0] = [mouse.x1, mouse.y1];
  [mouse.x1, mouse.y1] = [ev.pageX - mouse.startX, ev.pageY - mouse.startY];
}

function move(state, options, ev) {
  updateMouse(ev, options.mouse);
  if (options.publics.use_waapi) {
    waapiUpdate(options.mouse, options);
  } else {
    jsapiUpdate(options.mouse, options);
  }
}

function stop(state, options, ev) {
  const mouse = options.mouse;

  options.unsub();
  options.move.flush();
  ev.currentTarget.removeEventListener(ev.type, options.stop);

  if (options.publics.use_waapi) {
    options.anime.cancel();
  }
  updateMouse(ev, mouse);
  jsapiUpdate(mouse, options);
}

function waapiUpdate(mouse, options) {
  let adjustedLast = mouse.limitToBounds(mouse.x0, mouse.y0);
  let adjustedCurr = mouse.limitToBounds(mouse.x1, mouse.y1);
  
  options.anime.cancel();
  let timing = {
    duration: 16,
    fill: 'both',
    iterations: 1,
  };
  let keyframes = [
    { transform: `translate(${adjustedLast[0]}px,${adjustedLast[1]}px)` },
    { transform: `translate(${adjustedCurr[0]}px,${adjustedCurr[1]}px)` },
  ];
  options.anime = options.self.animate(keyframes, timing);
}

function jsapiUpdate(mouse, options) {
  const css   = options.self.style;
  css.left = `${mouse.startX + mouse.x1 - mouse.offsetX}px`;
  css.top  = `${mouse.startY + mouse.y1 - mouse.offsetY}px`;
}

module.exports = {
  draggable: draggable,
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {



/***/ }),
/* 4 */
/***/ (function(module, exports) {



/***/ }),
/* 5 */
/***/ (function(module, exports) {



/***/ }),
/* 6 */
/***/ (function(module, exports) {



/***/ }),
/* 7 */,
/* 8 */,
/* 9 */
/***/ (function(module, exports) {

const Utils = {
  /**
   * @param {HTMLElement} self
   * @param {WeakMap} settingsList
   * @param {*} param parameter passed to handler
   * @param {object} defaults default public options
   * @param {object} methods Associate array, key = method name,
   * value = method defintion
   * @returns {boolean} true if specify options, false if method call
   */
  setup: function (self, settingsList, param, defaults, methods) {
    if (!settingsList.has(self)) {
      settingsList.set(self, {
        publics: Utils.assign({}, defaults, 0),
      });
    }
    const options = settingsList.get(self);
    const isBlank = param == null; // True if null/undefined

    // Control program flow based on type of {param}
    switch (typeof param) {
      case 'string': // Execute method
        if (methods.hasOwnProperty(param)) {
          throw new SyntaxError(`'${param}' is an invalid method`);
        } else {
          methods[param](options);
          return false;
        }
        
      case 'object': // Proceed with normal setup
        options.publics = Utils.defaults(options.publics, isBlank ? {} : param);
        return true;

      default:
        if (isBlank) {
          return true;
        } else {
          throw new SyntaxError('pass nothing, an object, or a string');
        }
    }
  },

  /**
   * 
   * 
   * @param {object} options parameter passed to handler
   * @param {string} property name of
   * @param {*} value Value to overwrite with if it's not null
   */
  defaultAssign: function (options, property, value) {
    const newValue = (options[property] == null) // if null or undefiend
      ? value
      : options[property];
    options[property] = newValue;
    return newValue;
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
          ? temp.constructor() // Do not clone children
          : Utils.assign(temp.constructor(), temp, depth - 1)) // clone
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

/***/ }),
/* 10 */
/***/ (function(module, exports) {

// Only
const Mouse = {
  x0: 0, y0: 0,
  x1: 0, y1: 0,
  minX: 0, minY: 0,
  maxX: 0, maxY: 0,
  offsetX: 0,
  offsetY: 0,

  updateFromEvent: function (ev) {
    Mouse.update(ev.pageX, ev.pageY);
  },
  update: function (x, y) {
    Mouse.x0 = Mouse.x1; Mouse.y0 = Mouse.y1;
    Mouse.x1 = x;        Mouse.y1 = y;
  },
  deltaX: function () {
    return Mouse.x1 - Mouse.x0;
  },
  deltaY: function () {
    return Mouse.y1 - Mouse.y0;
  },

  setOffset: function (e, rect) {
    Mouse.offsetX = e.pageX - rect.left; 
    Mouse.offsetY = e.pageY - rect.top; 
  },

  setBounds: function (e, target, container) {
    const inner = target.getBoundingClientRect();
    const outer = container.getBoundingClientRect();
    Mouse.setOffset(e, inner);
    Mouse.minX = outer.left -   inner.left;
    Mouse.minY = outer.top -    inner.top;
    Mouse.maxX = outer.width -  inner.width;
    Mouse.maxY = outer.height - inner.height;
  },

  limitToBounds: function (x, y) {
    const limitX = Math.max(Mouse.minX, Math.min(Mouse.maxX, x));
    const limitY = Math.max(Mouse.minY, Math.min(Mouse.maxY, y));
    return [limitX, limitY];
  },
};

module.exports = Mouse;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

const USE_WEAK_MAP = true;

function factory() {
  const obj = USE_WEAK_MAP ? new WeakMap() : {};
  if (USE_WEAK_MAP) {
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

function getKeySymbol(keys, param1) {
  for (let sym of Object.getOwnPropertySymbols(keys)) {
    if (deepEquals(keys[sym], param1)) {
      return { key: sym, found: true };
    }
  }
  return { found: false };
}

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

/***/ }),
/* 12 */
/***/ (function(module, exports) {

const eventTypeList = {
  //mousemove: WeakSet(document, [])
};

function emitter(ev) {
  const handlerList = eventTypeList[ev.type].get(ev.currentTarget);
  for (let entry of handlerList) {
    entry.value(ev);
  }
}

const EventStream = {
  subscribe: function (source, eventName, fn) {
    if (!eventTypeList.hasOwnProperty(eventName)) {
      console.log(`subscribe() - added ${eventName} WeakMap`);
      eventTypeList[eventName] = new WeakMap();
    }
    
    const uniqueId = Symbol();
    const eventHandlerMap = eventTypeList[eventName];
    if (!eventHandlerMap.has(source)) {
      console.log(`subscribe() - added event listener`);
      source.addEventListener(eventName, emitter);
      eventHandlerMap.set(source, []);
    }

    const handlerList = eventHandlerMap.get(source);
    handlerList.push({ key: uniqueId, value: fn });

    return function unsubscribe() {
      const length = handlerList.length;
      let index = -1;
      while (++index < length) {
        if (handlerList[index].key === uniqueId) {
          handlerList.splice(index, 1);
          break;
        }
        // Not sure 
      }
    };
  },

  throttle: function (wait, fn) {
    let cooldown = 0; // Reset timer and trigger at rising edge
    let time = Date.now();
    let timeoutID = null;

    const invokeFunc = function (that, args) {
      fn.apply(that, args);
    };

    function throttledFn(...args) {
      const delta = Date.now() - time;
      const check = cooldown - delta;

      // State changes
      // Placing outside of the trottle cause passing mouse updates at setTimeout creation
      // ie. at timeout resolve, you get old coordinates because they only update in this scope
      time += delta;
      
      // Set cooldown and trigger .move()
      if (check <= -wait) { // Rising edge
        cooldown = 0;
        invokeFunc(null, args);
      } else if (check <= 0) { // Falling edge
        cooldown = wait;
        timeoutID = setTimeout(invokeFunc, -check, null, args);
      } else { // We're on cooldown
        cooldown = cooldown - delta;
      }
    }

    throttledFn.flush = function () {
      //invokeFunc(this, args);
      clearTimeout(timeoutID);
    };
    return throttledFn;
  },

  /**
   * @param {...Array<function, ...*>} args
   * @returns {function}
   */
  flow: function (...args) {
    return function (input) {
      for (let fnGroup of args) {
        const fn = fnGroup.shift();
        input = fn.apply(null, fnGroup.concat([input]));
      }
      return input;
    };
  },

  scan: function () {
  },

  map: function () {
  },
};

module.exports = EventStream;

/***/ })
/******/ ]);
// UMD returnExports.js adapated with Lodash module stuff (I don't really know what I'm doing though)
(function (factory) {
  // Detect free variable `global` from Node.js.
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
  // Detect free variable `self`.
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
  // Used as a reference to the global object.
  var root = freeGlobal || freeSelf || Function('return this')();
  
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    root.Interactable = factory(root);
    define(function() {
      return factory(root);
    });
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
  const Mouse = require('./helpers/mouse.js');
  const draggable =    require('./draggable.js');
  const resizeable =   require('./resizeable.js');
  const selectable =   require('./selectable.js');
  const sortable =     require('./sortable.js');
  const takedropable = require('./takedropable.js');

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
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
  // Combine the separate functionality and return an Interactable object
  // Only need to require everything one time per page
  // Doing it this way, all requires are compressed into single file by WebPack
  const WeakMapFacade = require('./helpers/weakmapfacade.js');
  const Utils = require('./helpers/utils.js');

  const apis = {
    draggable:     require('./draggable.js'),
    dropunloadble: require('./dropunloadble.js'),
    resizeable:    require('./resizeable.js'),
    selectable:    require('./selectable.js'),
    sortable:      require('./sortable.js'),
  };

  // Storage to keep track of state between events
  // DOM HTMLElements serve as the key, the options state serve as values
  // Similar concept to jQuery data
  // Only need to create this once to be shared across entire page
  const drag = WeakMapFacade();
  const resize = WeakMapFacade();
  const select = WeakMapFacade();
  const sort = WeakMapFacade();
  const takedrop = WeakMapFacade();

  // Interactable defintion
  return function (element) {
    const state = { // Private variables
      self: element,
      document: root.document,

      drag:     drag,
      resize:   resize,
      select:   select,
      sort:     sort,
      takedrop: takedrop,
    };
    Object.keys(apis).forEach(function (key) { apis[key].init(state); });

    // Return an object (monad) that you can chain the other functions on
    return {
      draggable:     Utils.reverseBind(state, apis.draggable.api),
      dropunloadble: Utils.reverseBind(state, apis.dropunloadble.api),
      resizeable:    Utils.reverseBind(state, apis.resizeable.api),
      selectable:    Utils.reverseBind(state, apis.selectable.api),
      sortable:      Utils.reverseBind(state, apis.sortable.api),
    };
  };
}));
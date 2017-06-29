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
  const Utils = require('./helpers/utils.js')

  const draggable =    require('./draggable.js');
  const resizeable =   require('./resizeable.js');
  const selectable =   require('./selectable.js');
  const sortable =     require('./sortable.js');
  const takedropable = require('./takedropable.js');

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
    console.log(state);

    // Return an object (monad) that you can chain the other functions on
    return {
      draggable:    Utils.reverseBind(state, draggable.api),
      resizeable:   Utils.reverseBind(state, resizeable),
      selectable:   Utils.reverseBind(state, selectable),
      sortable:     Utils.reverseBind(state, sortable),
      takedropable: Utils.reverseBind(state, takedropable),
    };
  };
}));
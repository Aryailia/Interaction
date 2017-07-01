const Utils = require('./helpers/utils.js');
const Mouse = require('./helpers/mouse.js');
const WeakMapFacade = require('./helpers/weakmapfacade.js');
const EventStream = require('./helpers/subscribe.js');

/**
 */
// Structure of options (used within api())
const defaults = {
  document: null,
  self: null,
  destroyable: false,

  events: {
  },
  press: null,
  move: null,

  control: {
    start: false,
  },
  flag: {
    add: false,
    range: false,
  },

  // Default values and possible properties that {param} can take
  publics: { // Properties outside of this will result in error
    selecting: 'ui-selecting',
    selected: 'ui-selected',
  },
};

// Method definitions
const methods = {
  destroy: function () {},
};

const selectable = {
  init: function (state) {
    state.selectingList = WeakMapFacade();
    state.selectedList = WeakMapFacade();
  },

  api: function(state, param) {
    try {
      const setup = Utils.setup(state.self, state.select, defaults, param, methods);
      if (setup.done) { // If execution is completed,
        return setup.value; // Exit with method's return value
      }
    } catch(err) { // Catch any malformed api usage
      throw new Error( `selectable\n${err}`);
    }

    const doc = state.document;
    const self = state.self;
    const options = state.select.get(self);
    const publics = options.publics;

    // Do not do anything if already run once (set during defaults on first run)
    if (!options.destroyable) {
      options.destroyable = true;

      options.self = self;
      options.document = doc;
      options.prelist = state.selectingList;
      options.list = state.selectedList;

      options.press = Utils.reverseBind(options, press);
      options.over = Utils.reverseBind(options, over);
      options.release = Utils.reverseBind(options, release);
      self.addEventListener('mousedown', options.press);
      self.addEventListener('mouseover', options.over);
      self.addEventListener('mouseup', options.release);
    }
  },
};

function isChildOf(parent, toTest) {
  while ((toTest = toTest.parentNode).tagName.toLowerCase() !== 'html') {
    if (toTest === parent) {
      return true;
    }
  }
  return false;
}

// Event handlers
function press(options, ev) {
  const target = ev.target;
  const publics = options.publics;

  options.control.start = true;
  options.flag.add = ev.ctrlKey;
  //options.flag.range = ev.shiftKey;
  deselectAllIf(options, function () { return !options.flag.add; });

  if (isChildOf(options.self, target)) {
    //target.draggable = false;
    selecting(options, target);
  }
}

function over(options, ev) {
  const publics = options.publics;
  if (options.control.start && isChildOf(options.self, ev.target)) {
    deselectAllIf(options, function (node) {
      return /*!options.flag.range &&*/ !node.classList.contains(publics.selected);
    });
    selecting(options, ev.target);
  }
}

function release(options, ev) {
  const publics = options.publics;
  options.control.start = false;
  
  // Convert all selecting to selected
  Array.from(options.self.childNodes) // NodeList one
    .filter(function (node) { return node.nodeType === Node.ELEMENT_NODE; })
    .filter(function (node) { return node.classList.contains(publics.selecting); })
    .forEach(function (node) {
      node.classList.remove(publics.selecting);
      node.classList.add(publics.selected);
    });
}

function selecting(options, target) {
  options.list.set(target, true);
  target.classList.add(options.publics.selecting);
}

function deselect(options, target) {
  options.prelist.delete(target);
  target.classList.remove(options.publics.selecting);
  options.list.delete(target);
  target.classList.remove(options.publics.selected);
}

function deselectAllIf(options, predicate) {
  Array.from(options.self.childNodes) // NodeList one
    .filter(function (node) { return node.nodeType === Node.ELEMENT_NODE; })
    .filter(predicate)
    .forEach(Utils.reverseBind(options, deselect));
}

module.exports = selectable;
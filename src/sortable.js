const Utils = require('./helpers/utils.js');
//const EventStream = require('./helpers/subscribe.js');

/**
 * @todo Remove updateMouse function
 */
// Structure of options (used within api())
const defaults = {
  document: null,
  self: null,
  destroyable: false,

  stop: null,
  move: null,

  // Default values and possible properties that {param} can take
  publics: { // Properties outside of this will result in error
    selecting: '',
    selected: '',
  },
};

// Method definitions
const methods = {
  destroy: function () {},
};

const sortable = {
  init: function (state) {},

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
    const options = state.drag.get(self);
    const publics = options.publics;

    // Do not do anything if already run once (set during defaults on first run)
    if (!options.destroyable) {
      options.destroyable = true;

      
    }
  },
};

// Event handlers
function press(options, ev) {
}

function release(options, ev) {
}

function select(options, ev) {
}

module.exports = sortable;
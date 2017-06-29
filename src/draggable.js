const Utils = require('./helpers/utils.js');
const EventStream = require('./helpers/subscribe.js');
const mouse = require('./helpers/mouse.js');

/**
 * @todo Remove updateMouse function
 */
// Structure of options (used within api())
const defaults = {
  document: null,
  mouse: null,
  
  self: null,
  handle: null,
  anime: null,

  stop: null,
  move: null,

  // Default values and possible properties that {param} can take
  publics: { // Properties outside of this will result in error
    handle: null,
    helper: null,
    use_waapi: false,
    throttle: 100,
  },
};

// Method definitions
const methods = {
  destroy: function () {},
};

const draggable = {
  api: function(state, param) {
    try {
      const setup = Utils.setup(state.self, state.drag, defaults, param, methods);
      if (setup.done) { // If execution is completed,
        return setup.value; // Exit with method's return value
      }
    } catch(err) { // Catch any malformed api usage
      throw new Error( `draggable\n${err}`);
    }

    const self = state.self;
    const options = state.drag.get(self);
    const publics = options.publics;

    // Set private variables
    self.style.position = 'absolute';
    options.document = document;
    options.mouse = mouse;
    options.self = self;
    if (publics.use_waapi && options.anime != null) {
      options.anime = new Animation();
    }
    
    // More setting defaults (setting defaults)
    publics.handle = publics.handle == null ? self : publics.handle;
    
    // Event Listening
    options.stop = _wrap(options, stop);
    options.move = EventStream.flow(
      [_wrap, options],
      [EventStream.throttle, options.publics.throttle]
    )(move);
    publics.handle.addEventListener('mousedown', _wrap(options, start));
  }
};

// Event handlers
function start(options, ev) {
  //const target = _findMarkedParent(_draggableList, e.target);
  const self = options.self;
  const mouse = options.mouse;

  mouse.setBounds(ev, self, self.parentNode); // Set client bounding boxes
  [mouse.startX, mouse.startY] = [ev.pageX, ev.pageY];

  // Add more event listeners
  options.unsub = EventStream.subscribe(options.document, 'mousemove', options.move);
  options.document.addEventListener('mouseup', options.stop);
}

function move(options, ev) {
  _updateMouse(ev, options.mouse);
  if (options.publics.use_waapi) {
    _waapiUpdate(options.mouse, options);
  } else {
    _jsapiUpdate(options.mouse, options);
  }
}

function stop(options, ev) {
  const mouse = options.mouse;

  // Cleanup event handlers to stop dragging
  options.unsub();
  options.move.flush();
  ev.currentTarget.removeEventListener(ev.type, options.stop);

  if (options.publics.use_waapi) {
    options.anime.cancel(); // Cancel any currently running animations
  }
  _updateMouse(ev, mouse); // Update mouse for jsapiUpdate
  _jsapiUpdate(mouse, options); // Apply final resting position
}



// Helper functions
function _updateMouse(ev, mouse) {
  [mouse.x0, mouse.y0] = [mouse.x1, mouse.y1];
  [mouse.x1, mouse.y1] = [ev.pageX - mouse.startX, ev.pageY - mouse.startY];
}

function _wrap(options, fn) {
  return function (ev) {
    return fn(options, ev);
  };
}

function _waapiUpdate(mouse, options) {
  console.log('using waapi');
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

// Javascript Absolute 
function _jsapiUpdate(mouse, options) {
  const css   = options.self.style;
  css.left = `${mouse.startX + mouse.x1 - mouse.offsetX}px`;
  css.top  = `${mouse.startY + mouse.y1 - mouse.offsetY}px`;
}

module.exports = draggable;
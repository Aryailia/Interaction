const Utils = require('./helpers/utils.js');
const EventStream = require('./helpers/subscribe.js');
const mouse = require('./helpers/mouse.js');

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
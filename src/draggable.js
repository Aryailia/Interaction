const Utils = require('./utils.js');

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

  // More defaults, and variable setting of {options}
  options.self = self;
  const handle = Utils.defaultAssign(publics, 'handle', self);
  if (publics.use_waapi) { options.anime = new Animation(); }
  
  // Event Handlers
  console.log(handle);
  handle.addEventListener('mousedown', wrap(state, options, start));
  state.document.addEventListener('mousemove', wrap(state, options, throttledMove));
  state.document.addEventListener('mouseup', wrap(state, options, stop));
  //subscribe(state.globalEvents, 'mousemove', options, state.mouse, start);
}

function wrap(state, options, fn) {
  return function (ev) {
    fn(state, options, ev);
  };
}

function subscribe(events, type, options, mouse, fn) {
  events[type].set(options.handle, wrap(options, mouse, fn));
}

function unsubscribe(events, type, options) {
  events[type].delete(options.handle);
}

function start(state, options, ev) {
  //const target = _findMarkedParent(_draggableList, e.target);
  const self = options.self;
  const mouse = state.mouse;

  mouse.setBounds(ev, self, self.parentNode);
  [mouse.startX, mouse.startY] = [ev.pageX, ev.pageY];
  options.cooldown = 0; // Reset timer and trigger at rising edge
  options.time = Date.now();
  options.timeoutID = null;
  state.activeDraggables.add(options); 
}

function updateMouse(ev, mouse) {
  [mouse.x0, mouse.y0] = [mouse.x1, mouse.y1];
  [mouse.x1, mouse.y1] = [ev.pageX - mouse.startX, ev.pageY - mouse.startY];
}

function throttledMove(state, blah, ev) {
  for (let options of state.activeDraggables) {
    console.log(options);
    const deltaTime = Date.now() - options.time;
    const check = options.cooldown - deltaTime;

    // State changes
    // Placing outside of the trottle cause passing mouse updates at setTimeout creation
    // ie. at timeout resolve, you get old coordinates because they only update in this scope
    updateMouse(ev, state.mouse);
    options.time += deltaTime;
    
    // Set cooldown and trigger .move()
    if (check <= -options.throttle) { // Rising edge
      options.cooldown = 0;
      move(state, options);
    } else if (check <= 0) { // Falling edge
      options.cooldown = options.publics.throttle;
      options.timeoutID = setTimeout(move, -check, state, options);
    } else { // We're on cooldown
      options.cooldown = options.cooldown - deltaTime;
    }
  }
}

function move(state, options) {
  if (options.publics.use_waapi) {
    waapiUpdate(state.mouse, options);
  } else {
    jsapiUpdate(state.mouse, options);
  }
}

function stop(state, blah, ev) {
  const mouse = state.mouse;
  for (let options of state.activeDraggables) {
    clearTimeout(options.timeoutID);
    if (options.use_waapi) {
      options.anime.cancel();
    }
    updateMouse(ev, mouse);
    jsapiUpdate(mouse, options);
  }
  state.activeDraggables.clear();
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

/*// Require setTimeout?
throttledMove: function (e) {
  for (let dragHandle of _activeDrags) {
    const options = _draggableList.get(dragHandle);
    const deltaTime = Date.now() - options.time;
    const check = options.cooldown - deltaTime;

    // State changes
    // Placing outside of the trottle cause passing mouse updates at setTimeout creation
    // ie. at timeout resolve, you get old coordinates because they only update in this scope
    _drag.updateMouse(e, options.mouse);
    options.time += deltaTime;
    
    // Set cooldown and trigger .move()
    if (check <= -options.throttle) { // Rising edge
      options.cooldown = 0;
      _drag.move(e, dragHandle);
    } else if (check <= 0) { // Falling edge
      options.cooldown = options.throttle;
      options.timeoutID = setTimeout(_drag.move, -check, e, dragHandle);
    } else { // We're on cooldown
      options.cooldown = options.cooldown - deltaTime;
    }
  }
},

updateMouse: function (e, mouse) {
  [mouse.x0, mouse.y0] = [mouse.x1, mouse.y1];
  [mouse.x1, mouse.y1] = [e.pageX - mouse.startX, e.pageY - mouse.startY];
},

move: function (e, handle) {
  const options = _draggableList.get(handle);
  if (USE_WAAPI) {
    _drag.waapiUpdate(e, options);
  } else {
    _drag.jsapiUpdate(e, options);
  }
},

waapiUpdate: function(e, options) {
  let mouse = options.mouse;
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
},

jsapiUpdate: function (e, options) {
  let mouse = options.mouse;
  let css   = options.self.style;
  css.left = (mouse.startX + mouse.x1 - mouse.offsetX) + 'px';
  css.top  = (mouse.startY + mouse.y1 - mouse.offsetY) + 'px';
},

stop: function (e) {
  for (let dragHandle of _activeDrags) {
    let options = _draggableList.get(dragHandle);
    let mouse = options.mouse;
    clearTimeout(options.timeoutID);

    if (USE_WAAPI) {
      options.anime.cancel();
    }

    _drag.updateMouse(e, mouse);
    _drag.jsapiUpdate(e, options);
  }

  _activeDrags.clear();
},*/


/*

  const self = state.self;
  const settingsList = state.drag;
  Utils.setup(self, state.drag, param, );
  if (!settingsList.has(self)) {
    settingsList.set(self, {
      privates: {},
      publics: Utils.assign({}, defaults, 0),
    });
  }
  const options = settingsList.get(self);

  // Control program flow based on type of {param}
  switch (typeof param) {
    case 'string': // Execute method
      if (methods.hasOwnProperty(param)) {
        throw new SyntaxError(`draggable - '${param}' is an invalid method`);
      } else {
        methods[param](options);
        return;
      }
    case 'object': // Proceed with normal setup
      options.publics = Utils.defaults(
        options.publics, param == null ? {} : param);
      break;
    default: throw new SyntaxError('draggable - pass an object or string');
  }

  const privates = options.prviates;
  const publics = options.publics;
*/

module.exports = {
  draggable: draggable,
};
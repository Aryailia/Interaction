'use strict';
// Note more specific occurs before it bubles outwards towards window
// To Do:
// - need to do a dom travel for initial subscribe
// - live collections reduced to arrays
//
// So two concepts either using _handlers.subscribe to add handler to document
// Or adding to handler to event individually

(function(namespace) { 
  let Interactable2 = function (param) {
    //param = '.ui-active-bar';
    let target = typeof param === 'string'
      ? Array.prototype.slice.call(document.querySelectorAll(param))
      : [param];
    
    let obj = Object.create(null);
    obj.self = target;
    _shallowAssign(obj, InteractMixin);
    return obj;
  };

  let InteractMixin = {
    draggable:  function (options) { _drag.setter(this.self, options); },
    resizeable: function (options) { _drag.setter(this.self, options); },
    selectable: function (options) { _drag.setter(this.self, options); },
    sortable:   function (options) { _drag.setter(this.self, options); },
    unloadable: function (options) { _drag.setter(this.self, options); },
  };

  // These are all replacable with an array or associative array
  // Just leveraging the weak memory properties
  let _draggableList = new WeakMap(); // Should contain drag handles
  let _resizeableList = new WeakSet();
  let _selectableList = new WeakSet();
  let _sortableList = new WeakSet();
  let _unloadableList = new WeakSet();
  let _eventHandlers = new WeakMap(); // linked with _subscribe()

  // Interactable.draggable() logic
  // _activeDrags should contain the handles for the drags used to search _draggableList
  let _activeDrags = new Set(); // Stores HTMLElements currently actively being dragged
  let _DRAG_DEFAULT = {
    container: undefined,
    throttle: 100,
    toClone: undefined,
  };

  let _drag = {
    setter: function (handlers, options) {
      for (let handle of handlers) {
        // Deal with settings
        let settings = _applySettings(_DRAG_DEFAULT, options ? options : {});
        if (typeof settings.toClone === 'undefined') { settings.toClone = handle; }
        if (typeof settings.container === 'undefined') { settings.container = handle.parentNode; }
        if (USE_WAAPI) { settings.anime = new Animation(); }
        _shallowAssign(settings, {
          mouse: _shallowAssign(Object.create(null), MouseMixin), // Consider just saving offset
          self: handle
        });

        // Remove existing drag

        // Save settings and event handlers
        settings.self.style.position = 'absolute';
        _draggableList.set(handle, settings);
        _subscribe(handle, 'mousedown', _drag.start);
        _subscribe(document, 'mousemove', _drag.throttledMove);
        _subscribe(document, 'mouseup', _drag.stop);
      }
    },

    start: function (e) {
      const target = _findMarkedParent(_draggableList, e.target);
      const options = _draggableList.get(target);
      const mouse = options.mouse;
      
      mouse.setBounds(e, target, options.container);
      [mouse.startX, mouse.startY] = [e.pageX, e.pageY];
      options.cooldown = 0; // Reset timer and trigger at rising edge
      options.time = Date.now();
      options.timeoutID = null;

     _activeDrags.add(target);
    },

    // Require setTimeout?
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
    },
  };

  var USE_WAAPI = false;

  let MouseMixin = {
    startX: 0, startY: 0,
    x0: 0, y0: 0,
    x1: 0, y1: 0,
    minX: 0, minY: 0,
    maxX: 0, maxY: 0,
    offsetX: 0, offsetY: 0,

    setOffset: function (e, rect) {
      this.offsetX = e.pageX - rect.left; 
      this.offsetY = e.pageY - rect.top; 
    },

    setBounds: function (e, target, container) {
      let inner = target.getBoundingClientRect();
      let outer = container.getBoundingClientRect();
      this.setOffset(e, inner);
      this.minX = outer.left -   inner.left;
      this.minY = outer.top -    inner.top;
      this.maxX = outer.width -  inner.width;
      this.maxY = outer.height - inner.height;
    },

    limitToBounds: function (x, y) {
      let limitX = Math.max(this.minX, Math.min(this.maxX, x));
      let limitY = Math.max(this.minY, Math.min(this.maxY, y));
      return [limitX, limitY];
    },
  };

  let _resize = {
    
  };

  let _select = {
    setter: function (e, ) {

    },
  };

  let _sort = {

  };

  let _unload = {
    
  };

  // Helper Private Functions
  function _shallowAssign(obj, mixin) {
    var props = Object.getOwnPropertyNames(mixin);
    props.forEach(function(key) {
      var desc = Object.getOwnPropertyDescriptor(mixin, key);
      Object.defineProperty(obj, key, desc);
    });
    return obj;
  }

  function _findMarkedParent(inObj, lookingFor) {
    let searchee = lookingFor;
    do { // Stop with window as last element
      if (inObj.has(searchee)) return searchee;
    } while ((searchee = searchee.parentNode) !== document);
    if (inObj.has(document)) return document;
    if (inObj.has(window))   return window;
    return false;
  }

  // Makes sure to just add one event handler
  // The only interface needed is _handler.subscribe(<eventName>, <fn>);
  function _subscribe(handle, eventName, fn) {
    // Gets the events associated with <handle> stored in <_handles>
    let events = _eventHandlers.has(handle)
      ? events = _eventHandlers.get(handle) 
      : {};
    if (_eventHandlers.has(handle)) {
      _eventHandlers.set(handle, events);// Or makes it if doesn't exist
    }

    // Adds the event listener to <handle> if it doesn't exist already
    if (!events.hasOwnProperty(eventName)) {
      handle.addEventListener(eventName, function (eventObject) {
        for (let element of events[eventName]) {
          element(eventObject); 
        }  
      });
    }
    
    // Events 
    let list = events.hasOwnProperty(eventName)
      ? events[eventName]
      : events[eventName] = new Set();
    list.add(fn); // Sets don't add duplicates
  }

  function _unsubscribe(handle, eventName, fn) {
    _eventHandlers.get(handle)[eventName].delete(fn);
  }

  function _applySettings(defaults, options) {
    let settings = Object.create(null);
    for (let key of Object.keys(defaults)) {
      settings[key] = options.hasOwnProperty(key)
        ? options[key]
        : defaults[key];
    }
    return settings;
  }

  namespace.Interactable2 = Interactable2;
}(this));
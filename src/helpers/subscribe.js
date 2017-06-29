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
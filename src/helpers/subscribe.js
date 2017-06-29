const eventTypeList = {
  //mousemove: WeakSet(document, [])
};

function emitter(ev) {
  const handlerList = eventTypeList[ev.type].get(ev.currentTarget);
  for (let fn of handlerList) {
    fn(ev);
  }
}

const EventStream = {
  subscribe: function (source, eventName, fn) {
    if (!eventTypeList.hasOwnProperty(eventName)) {
      eventTypeList[eventName] = new WeakMap();
    }
    
    const uniqueId = Symbol();
    const eventHandlerMap = eventTypeList[eventName];
    if (!eventHandlerMap.has(source)) {
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

  throttle: function () {
  },
  scan: function () {
  },

  map: function () {
  },
};

module.exports = EventStream;
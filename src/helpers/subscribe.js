const eventTypeList = {
  //mousemove: WeakSet(document, [])
};

function handler(ev) {

}

const EventStream = {
  subscribe: function (source, eventName) {
    if (!eventTypeList.hasOwnProperty(eventName)) {
      eventTypeList[eventName] = new WeakMap();
    }
    
    if (!eventTypeList[eventName].has(source)) {
      source.addEventListener(eventName, handler);
      eventTypeList[eventName].set(source, []);
    }
  },

  throttle: function () {
  },
  scan: function () {
  },

  map: function () {
  },
};

module.exports = EventStream;
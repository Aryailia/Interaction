// Only
const Mouse = {
  x0: 0, y0: 0,
  x1: 0, y1: 0,
  minX: 0, minY: 0,
  maxX: 0, maxY: 0,
  offsetX: 0,
  offsetY: 0,

  updateFromEvent: function (ev) {
    Mouse.update(ev.pageX, ev.pageY);
  },
  update: function (x, y) {
    Mouse.x0 = Mouse.x1; Mouse.y0 = Mouse.y1;
    Mouse.x1 = x;        Mouse.y1 = y;
  },
  deltaX: function () {
    return Mouse.x1 - Mouse.x0;
  },
  deltaY: function () {
    return Mouse.y1 - Mouse.y0;
  },

  setOffset: function (e, rect) {
    Mouse.offsetX = e.pageX - rect.left; 
    Mouse.offsetY = e.pageY - rect.top; 
  },

  setBounds: function (e, target, container) {
    const inner = target.getBoundingClientRect();
    const outer = container.getBoundingClientRect();
    Mouse.setOffset(e, inner);
    Mouse.minX = outer.left -   inner.left;
    Mouse.minY = outer.top -    inner.top;
    Mouse.maxX = outer.width -  inner.width;
    Mouse.maxY = outer.height - inner.height;
  },

  limitToBounds: function (x, y) {
    const limitX = Math.max(Mouse.minX, Math.min(Mouse.maxX, x));
    const limitY = Math.max(Mouse.minY, Math.min(Mouse.maxY, y));
    return [limitX, limitY];
  },
};

module.exports = Mouse;
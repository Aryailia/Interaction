'use strict'
// To Do:
// - fix to work with scrolling
// - add drop
// - add/remove events on drag initiation
// - convert dragging event from request animation frame to animation promises
// - add evt.preventDefault() to stop links and other such behaviour
// - add touch support

var Interactable;

(function() { 
  // Main class
  Interactable = class {
    constructor(box) {
      if (typeof box === 'string')
        this.box = document.querySelectorAll(box);
      else
        this.box = box;

      // Set the default options
      this.options = _DEFAULT_SETTINGS; // Set possible options and their defaults

      this._isDraggable = false;
      this._isResizeable = false;
      //this._isSelectable = false; // Handled by selectableSelector
      this._isSortable = false;
      //this._isUnloadable = false; // Handled by unloadSelector

      // Set all the mouse methods to accessible via <this._mousedown>/<this._mouseup> etc.
      // and bind attached functions to <this> so they can be removed afterwards
      // Bind creates new functions that won't be registered by removeEventListener as the same function
      this._mousedown = _mousedown.bind(this);
      this._mouseup = _mouseup.bind(this);
      this._dragover = _dragover.bind(this);
      this._dragstart = _dragstart.bind(this);
      this._dragend = _dragend.bind(this);
      this._drag = _drag.bind(this);

      // Keyboard Events
    }
  };

  function test () {
    console.log('test');
  }

  let method = Interactable.prototype;

  /**
   * Settings
   */
  // Static lists of possible settings and their defaults
  const _DEFAULT_SETTINGS = new Map([
    ['selectClass', ''],
    ['classPrefix', 'ui-'],
    ['unloadSelector', ''],
  ]);
  // Overwrites any already-present settings in <base> with ones in <this>
  function _applyNewSettings(value, key, base) {
    if (this.hasOwnProperty(key))
      base.set(key, this[key]);
  }


  /**
   * More Private Stuff
   */
  // Keeps track of the mouse for positioning
  class AnimationMouse {
    constructor(container, target) {
      // Going to assume this is constant for performance
      // Otherwise have to calculate them on value use
      this.container = container.getBoundingClientRect();
      this.target = target;
      this.maxX = 2147483646; // Just a large number
      this.maxY = 2147483646;
      this.anime; // Will be the animation player if I decide to migrate from 

      // Mouse-related positions, the mouse position as-is
      this.x1 = 0; // Pre-frame position
      this.y1 = 0;
      this.x2 = 0; // In-frame position
      this.y2 = 0;
      this.offsetX = 0; // Mouse relative position
      this.offsetY = 0;
    }
    
    // These properties just help with more readable code
    // <last> for the previous frame, <curr> for the current
    set last(val) { [this.x1, this.y1] = val; }
    get last()    { return [this.x1, this.y1]; }
    set curr(val) { [this.x2, this.y2] = val; }
    get curr()    { return [this.x2, this.y2]; }
    
    // Initialize the values for the mousedown event that kickstarts drag
    // Again assumes <this.container> isn't being resized
    setInitialPosition(e) {
      let rect = this.target.getBoundingClientRect();
      this.maxX = this.container.width  - rect.width;
      this.maxY = this.container.height - rect.height;
      
      this.offsetX = e.pageX - rect.left;
      this.offsetY = e.pageY - rect.top;
      this.curr = this.last = [e.pageX, e.pageY] ; // Relative to viewport one
    }
    
    // The final position for this.target if it must remain within the bounds of this.container
    // Assumes that this.container
    /* Normal Version
    finalPos(pos)  {
      let x = pos[0] - this.offsetX;
      let y = pos[1] - this.offsetY;
      
      // Force the Boxes to stay within containers bounding boxes
      if (x < this.container.left) x = this.container.left;
      if (y < this.container.top)  y = this.container.top;
      if (x > this.maxX) x = this.maxX;
      if (y > this.maxY) x = this.maxY;
      console.log(this.container.left);

      return [x + 'px', y + 'px'];
    }*/
  
    // Animations do relative to container positions
    finalPos(pos)  {
      let x = pos[0] - this.offsetX - this.container.left;
      let y = pos[1] - this.offsetY - this.container.top;
      
      // Force the Boxes to stay within containers bounding boxes
      if (x < 0) x = 0;
      if (y < 0)  y = 0;
      if (x > this.maxX) x = this.maxX;
      if (y > this.maxY) x = this.maxY;

      return [x + 'px', y + 'px'];
    }
  }

  // For the animation so these objects aren't constantly remade
  let _timing = {
    duration: 100,
    fill: 'both',
    iterations: 1};
  let _keyframes = [{ transform: ''}, { transform: ''}];

  /**
   * Mouse Methods
   */
  // Mouse Move expects:
  // - <this>: class
  // - <e.target>: handle
  function _mousedown(e) {
    let prefix = this.options.get('classPrefix');
    this.handle.classList.add(prefix + 'selected');
    this._mouse.setInitialPosition(e);
    window.addEventListener('mouseup', this._mouseup);
    window.addEventListener('blur', this._mouseup);
  }
  function _mouseup(e) {
    let prefix = this.options.get('classPrefix');
    this.handle.classList.remove(prefix + 'selected');
    console.log('mouse up');
    window.removeEventListener('mouseup', this._mouseup);
    window.removeEventListener('blur', this._mouseup);
  }
  function _dragover(e) {
    this._mouse.curr = [e.pageX, e.pageY]; // Includes scroll one
  }

  function _dragstart(e) {
    this._isDraggable = true;
    window.addEventListener('dragover', this._dragover);
    this.handle.addEventListener('dragend', this._dragend);

    this._time = performance.now();
    e.dataTransfer.setData('text', ''); // Need to transfer something or firefox refuses to trigger drag
    
    // Handle creating the ghost helper of <this.box> and position it to its computed position
    this._clone = this.box.cloneNode(true);
    let rect = this.box.getBoundingClientRect();
    this._clone.style.left = rect.left + 'px';
    this._clone.style.top  = rect.top + 'px';
    this.box.insertAdjacentElement('afterend', this._clone);
    this.box.style.position = 'absolute';

    // Start the drag animation
    window.requestAnimationFrame(this._drag);
  }

  function _drag(timestamp) {
    let dt = timestamp - this._time;
    this._time = timestamp;
    
    let mouse = this._mouse;
    let last = mouse.finalPos(mouse.last);
    let curr = mouse.finalPos(mouse.curr);

    /*this.box.animate([
      {transform: `translate(${delta})` },
      {transform: `translate(${delta})` }
    ], timing);//*/
    _keyframes[0].transform = `translate(${last[0]},${last[1]})`;
    _keyframes[1].transform = `translate(${curr[0]},${curr[1]})`;
    this.anime = this.box.animate(_keyframes, _timing);
    mouse.last = mouse.curr;//*/
    
    // If I decide to switch from request animation frame to animation player promises
    /*this.anime.finished.then(function () {
      console.log('animation promise working');
    });*/

    // Don't actually need to do this if animation is working
    //if (!this._isDraggable)
    //  [this.box.style.left, this.box.style.top] =  mouse.finalPos(mouse.cur);
    
    // If 'dragend' has not been triggered yet, continue animating
    if (this._isDraggable)
      window.requestAnimationFrame(this._drag);
  }

  function _dragend(e) {
    this._isDraggable = false;
    window.removeEventListener('dragover', this._dragover);
    this.handle.removeEventListener('dragend',  this._dragend);

    let targetSelector = this.options.get('unloadSelector');
    if (targetSelector !== '') {
      let target = this._getUnderneath(this.box, this._mouse.curr[0], this._mouse.curr[1]);
      console.log(target);

      if (target.closest(targetSelector)) {
        this.options.get('unloader').call(this, target);
      }
    }

    // Remove ghost holder
    this.box.parentNode.removeChild(this._clone);
    this._clone = null;
    console.log('dragstop');
    window.dispatchEvent(new MouseEvent('mouseup')); // Trigger mouseup because drag intercepts it
  }
  
  /**
   * (Other) Private functions
   */
  // This holds the 
  // Inspired by jQuery's name for their data object
//  let _cache = new Map();
  
  method._getUnderneath = function (target, x, y) {
    let disp = target.style.display;
    target.style.display = 'none';
    let under = document.elementFromPoint(x, y);
    target.style.display = disp;
    return under;
  };

  /**
   * Public Methods
   */
  method.draggable = function (container, handle, options) {
    this.container = container;
    this.handle = handle;
    this._mouse = new AnimationMouse(this.container, this.box);
    this._time = 0; // Tick for animation
    this._clone; // The ghost helper

    // Apply any options to the ones available already
    this.options.forEach(_applyNewSettings.bind(options)); // Write in any user-defined settings
    
    // Mouse Events: also add handles for dragover, dragend. mouseup, drag also fired.
    handle.draggable = true; // Sets the HTML5 attribute
    handle.addEventListener('mousedown', this._mousedown);
    handle.addEventListener('dragstart', this._dragstart);
    //this.box.classList.add(this.options.get('classPrefix') + 'draggable');
    return this;
  };
  method.resizeable = function () {
    //this.box.classList.add(this.options.get('classPrefix') + 'resizeable');
    return this;
  };
  method.selectable = function () {
    //this.box.classList.add(this.options.get('classPrefix') + 'selectable');
    return this;
  };
  method.sortable = function () {
    //this.console.log();
    
    //this.box.classList.add(this.options.get('classPrefix') + 'sortable');
    return this;
  };

  function test () {
    this.box.display();
  }

  method.unloadable = function (target, ondrop) {
    this.options.set('unloadSelector', target);
    this.options.set('unloader', ondrop);
    //this.box.classList.add(this.options.get('classPrefix') + 'droppable');
    return this;
  };
})();

/*window.addEventListener('DOMContentLoaded', function(){
  let a = new Interactable(document.getElementById('box1')).draggable(
    document.querySelector('#application'),
    document.querySelector('#box1 .ui-active-bar'), {});
  let b = new Interactable(document.getElementById('box2'));/*.draggable(
    document.querySelector('#application'),
    document.querySelector('#box2 .ui-active-bar'), {});//*/

/*  (new Interactable('.ui-tab-bar')).unloadable('', function () {
    console.log('not the bass');
  });
  //a.draggable();
});*/
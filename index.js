window.addEventListener('DOMContentLoaded', function() {
  var a = document.getElementById('box1');
  var b = document.getElementById('box2');
  Interactable(a).draggable().selectable();
});
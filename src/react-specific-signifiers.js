var keyMirror = require('react/lib/keyMirror');

var eventList = keyMirror({
  onCopy: null,
  onCut: null,
  onPaste: null,
  onKeyDown: null,
  onKeyPress: null,
  onKeyUp: null,
  onFocus: null,
  onBlur: null,
  onChange: null,
  onInput: null,
  onSubmit: null,
  onClick: null,
  onDoubleClick: null,
  onDrag: null,
  onDragEnd: null,
  onDragEnter: null,
  onDragExit: null,
  onDragLeave: null,
  onDragOver: null,
  onDragStart: null,
  onDrop: null,
  onMouseDown: null,
  onMouseEnter: null,
  onMouseLeave: null,
  onMouseMove: null,
  onMouseOut: null,
  onMouseOver: null,
  onMouseUp: null,
  onTouchCancel: null,
  onTouchEnd: null,
  onTouchMove: null,
  onTouchStart: null,
  onScroll: null,
  onWheel: null
});

var specificSignifiers = keyMirror({
  key: null
});

/**
 *
 */
function isReactSpecificSignifier(e) {
  return eventList.hasOwnProperty(e) || specificSignifiers.hasOwnProperty(e);
}

module.exports = isReactSpecificSignifier;

// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

define(function() {
  var module = {};
  module.KEY_NAMES = {
    'backspace': 8,
    'tab': 9,
    'enter': 13,
    'shift': 16,
    'ctrl': 17,
    'alt': 18,
    'pause/break': 19,
    'caps lock': 20,
    'esc': 27,
    'space': 32,
    'page up': 33,
    'page down': 34,
    'end': 35,
    'home': 36,
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'insert': 45,
    'delete': 46,
    'command': 91,
    'right click': 93,
    'numpad *': 106,
    'numpad +': 107,
    'numpad -': 109,
    'numpad .': 110,
    'numpad /': 111,
    'num lock': 144,
    'scroll lock': 145,
    'my computer': 182,
    'my calculator': 183,
    ';': 186,
    '=': 187,
    ',': 188,
    '-': 189,
    '.': 190,
    '/': 191,
    '`': 192,
    '[': 219,
    '\\': 220,
    ']': 221,
    "'": 222,
  }
  
  // Helper aliases
  
  module.KEY_ALIASES = {
    'windows': 91,
    '⇧': 16,
    '⌥': 18,
    '⌃': 17,
    '⌘': 91,
    'ctl': 17,
    'control': 17,
    'option': 18,
    'pause': 19,
    'break': 19,
    'caps': 20,
    'return': 13,
    'escape': 27,
    'spc': 32,
    'pgup': 33,
    'pgdn': 33,
    'ins': 45,
    'del': 46,
    'cmd': 91
  }
  
  
  /*!
   * Programatically add the following
   */
  
  // lower case chars
  for (i = 97; i < 123; i++) module.KEY_NAMES[String.fromCharCode(i)] = i - 32
  
  // numbers
  for (var i = 48; i < 58; i++) module.KEY_NAMES[i - 48] = i
  
  // function keys
  for (i = 1; i < 13; i++) module.KEY_NAMES['f'+i] = i + 111
  
  // numpad keys
  for (i = 0; i < 10; i++) module.KEY_NAMES['numpad '+i] = i + 96
  
  /**
   * Get by code
   *
   *   exports.name[13] // => 'Enter'
   */
  
  module.KEY_CODES = {} // title for backward compat
  
  // Create reverse mapping
  for (var i in module.KEY_NAMES) {
    if(module.KEY_CODES[module.KEY_NAMES[i]]==null)
      module.KEY_CODES[module.KEY_NAMES[i]] = i;
  }
  
  // Add aliases
  for (var alias in module.KEY_ALIASES) {
    module.KEY_NAMES[alias] = module.KEY_ALIASES[alias];  
  }
  return module;
});
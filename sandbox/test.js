var transform = require('./../index');
var fs = require('fs');

var React = require('react');
var mustache = require('mustache');

/**
 * helper to test render
 */
function render(result, data) {
  var m = mustache.render(result.mustache, data);
  var Component = React.createFactory(eval(result.js));
  var component = Component(data);
  var r = React.renderToStaticMarkup(component);
  return {
    mustache: m,
    react: r
  }
}

var jsx = fs.readFileSync('./components/main.jsx', 'utf-8');
var jsxtache = fs.readFileSync('./components/main.jsx.mustache', 'utf-8');

var result = transform(jsx, jsxtache, null);
// console.log(result.mustache);
// console.log(result.jsx)
//
// var x = React.createFactory(eval(result.js));
// var y = x({ arr: [{name: 'aaa'},{name: 'bbb'}]});
// var z = React.renderToString(y);
// console.log(z);

// var rendered = render(result, { arr: [{name: 'aaa'},{name: 'bbb'}]});
// console.log(rendered);

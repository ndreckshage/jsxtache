"use strict";

var mustache = require('mustache');
var React = require('react');

/**
 * helper to test render
 * typically, rendered mustache should === rendered react
 */
function render(result, data, mustachePartials) {
  var m = mustache.render(result.mustache, data, mustachePartials);
  var Component = React.createFactory(eval(result.js));
  var component = Component(data);
  var r = React.renderToStaticMarkup(component);
  return {
    mustache: m,
    react: r
  }
}

module.exports = render;

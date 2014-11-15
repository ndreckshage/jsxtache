"use strict";

var mustache = require('./smart-server-side-render-mustache');
var React = require('react');

/**
 * helper to test server rendered react vs makeshift dom rendered react
 */
function render(result, data, mustachePartials) {
  var m = mustache.render(result.mustache, data, mustachePartials);
  console.log(result.js)
  var Component = React.createFactory(eval(result.js));
  var component = Component(data);
  var r = React.renderToString(component);
  console.log('R:', r)
  var rootId = m.match(/data\-reactid\=[\'|\"]\.([a-z0-9]*)[\'\"]/)[1];
  r = r.replace(/data\-reactid\=([\'\"])\.[a-z0-9]*/g, 'data-reactid=$1.' + rootId);
  r = r.replace(/\s*data\-react\-checksum\=[\'|\"]\-*\w*\d*[\'\"]/, '');
  console.log('R:', r)
  return {
    mustache: m,
    react: r
  }
}

module.exports = render;

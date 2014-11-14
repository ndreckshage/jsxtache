"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('jsxtache handles comments', function() {
  it('handles comments', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>{{!ignore me}}</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { people: true });
    var expected = '<div></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

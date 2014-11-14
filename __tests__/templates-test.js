"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('jsxtache mustache template', function() {
  it('defers to mustache method', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  mustache: function() {",
      "    return (",
      "'<div>' +",
      "  '<p>Hello {{name}}</p>' +",
      "'</div>'",
      "    );",
      "  },",
      "  render: function() {",
      "    return (",
      "'<div>' +",
      "  '<p>Hello {this.props.name}</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { name: 'Nick' });
    var expected = '<div><p>Hello Nick</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

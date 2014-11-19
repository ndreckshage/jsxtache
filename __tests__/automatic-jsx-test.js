"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('automatically creates jsx if only jsxtache provided', function() {
  it('creates jsx', function() {
    var jsxtache = "<div><p>Hello {{this.props.name}}</p></div>";
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>' +",
      "  '<p>Hello {{this.props.name}}</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var resultA = transform(null, jsxtache);
    var resultB = transform(code);

    var renderedA = render(resultA, { there: 'there' });
    var renderedB = render(resultB, { there: 'there' });

    var expected = "<div><p>Hello </p></div>";
    expect(renderedA.mustache).toEqual(expected);
    expect(renderedA.react).toEqual(expected);
    expect(renderedB.mustache).toEqual(expected);
    expect(renderedB.react).toEqual(expected);
  });
});

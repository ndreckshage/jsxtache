"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('transforms with flow', function() {
  it('converts strict types', function() {
    var code = [
      "var React = require('react');",
      "function hello(name:string): string{ return name; }",
      "module.exports = React.createClass({",
      "  render: function(): any {",
      "    return (",
      "'<div{{*' +",
      "'  onClick: this._onClick\\n'+",
      "'*}}>' +",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  },",
      "  _onClick: function() {",
      "    console.log(hello('nick'));",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { name: 'Nick' });
    var expected = '<div><p>Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

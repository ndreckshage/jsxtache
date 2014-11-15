"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe("jsx specific signifiers", function() {
  it('handles collection keys', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '{{#this.props.people}}'+",
      "    '<p{{*\\n'+",
      "    '  key: true\\n'+",
      "    '*}}>Hello.</p>'+",
      "  '{{/this.props.people}}'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    expect(result.mustache).not.toMatch(/key/);
    expect(result.jsx).toMatch(/key\=\{ndx\}/);
    expect(result.js).toMatch(/key\:\s*ndx/);
    var rendered = render(result, { people: ['one', 'two'] });
    var expected = '<div><p>Hello.</p><p>Hello.</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles custom collection keys', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '{{#this.props.products}}'+",
      "    '<p{{*\\n'+",
      "    '  key: sku\\n'+",
      "    '*}}>Hello.</p>'+",
      "  '{{/this.props.products}}'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    expect(result.mustache).not.toMatch(/key/);
    expect(result.jsx).toMatch(/key\=\{scope\.sku\}/);
    expect(result.js).toMatch(/key\:\s*scope\.sku/);
    var rendered = render(result, { products: [{sku: 'JFJe3'},{sku: 'NFid33'}] });
    var expected = '<div><p>Hello.</p><p>Hello.</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles jsx properties', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div{{*\\n'+",
      "'  onTouchMove: this._onTouchMove\\n'+",
      "'*}}>'+",
      "  '{{#this.props.people}}'+",
      "    '<p{{*\\n'+",
      "    '  onClick: this._onClick\\n'+",
      "    '  onScroll: this._onScroll\\n'+",
      "    '*}}>Click Me.</p>'+",
      "  '{{/this.props.people}}'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var regexp = /onTouchMove.*onClick.*onScroll/;
    expect(result.mustache).not.toMatch(regexp);
    expect(result.jsx).toMatch(regexp);
    expect(result.js).toMatch(regexp);
    var rendered = render(result, { people: ['one', 'two'] });
    var expected = '<div><p>Click Me.</p><p>Click Me.</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

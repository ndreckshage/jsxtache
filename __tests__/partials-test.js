"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('jsxtache handles partials', function() {
  it('handles partials', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>{{> partial_a}}</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var codePartial = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<p>Hello</p>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var partial = transform(codePartial);

    jest.setMock('partial_a', eval(partial.js));
    var mustachePartials = { 'partial_a': partial.mustache };

    var rendered = render(result, {}, mustachePartials);
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('handles partials with context', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>{{#this.props.arr}}{{> partial_a}}{{/this.props.arr}}</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var codePartial = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<p>{{name}}</p>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var partial = transform(codePartial);

    jest.setMock('partial_a', eval(partial.js));
    var mustachePartials = { 'partial_a': partial.mustache };

    var rendered = render(result, { name: 'BAD', arr: [{ name: 'Nick' }, { name: 'Hello' }, { name: 'Goodbye' }]}, mustachePartials);
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('passes down state for client side interaction', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  getInitialState: function() {",
      "    return { count: this.props.count, something: this.props.something };",
      "  },",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '{{> partial_a}}'+",
      "        '{{#this.props.arr}}'+",
      "          '{{> partial_a}}'+",
      "        '{{/this.props.arr}}'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var codePartial = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  getInitialState: function() {",
      "    return { count: this.props.count, something: this.props.something };",
      "  },",
      "  render: function() {",
      "    return (",
      "      '<p>{{this.props.name}} - {{this.state.count}} - {{this.state.something}}</p>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var partial = transform(codePartial);

    expect(result.jsx).toMatch(/\{\.\.\.this\.props\}.*\{\.\.\.this\.state\}/);

    jest.setMock('partial_a', eval(partial.js));
    var mustachePartials = { 'partial_a': partial.mustache };

    var rendered = render(result, { count: 7, something: 'Hello', arr: [{ name: 'One', count: 99 }, { name: 'Two', count: 77 }] }, mustachePartials);
    var expected = '<div><p> - 7 - Hello</p><p>One - 99 - Hello</p><p>Two - 77 - Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

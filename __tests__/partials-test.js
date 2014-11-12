"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('jsxtache handles partials', function() {
  // it('handles partials', function() {
  //   var code = [
  //     "var React = require('react');",
  //     "module.exports = React.createClass({",
  //     "  render: function() {",
  //     "    return (",
  //     "      '<div>{{> partial_a}}</div>'",
  //     "    );",
  //     "  }",
  //     "});"
  //   ].join('\n');
  //
  //   var codePartial = [
  //     "var React = require('react');",
  //     "module.exports = React.createClass({",
  //     "  render: function() {",
  //     "    return (",
  //     "      '<p>Hello</p>'",
  //     "    );",
  //     "  }",
  //     "});"
  //   ].join('\n');
  //
  //   var result = transform(code);
  //   var partial = transform(codePartial);
  //
  //   jest.setMock('partial_a', eval(partial.js));
  //   var mustachePartials = { 'partial_a': partial.mustache };
  //
  //   var rendered = render(result, {}, mustachePartials);
  //   expect(rendered.mustache).toEqual(rendered.react);
  // });
  //
  // it('handles partials with context', function() {
  //   var code = [
  //     "var React = require('react');",
  //     "module.exports = React.createClass({",
  //     "  render: function() {",
  //     "    return (",
  //     "      '<div>{{#this.props.arr}}{{> partial_a}}{{/this.props.arr}}</div>'",
  //     "    );",
  //     "  }",
  //     "});"
  //   ].join('\n');
  //
  //   var codePartial = [
  //     "var React = require('react');",
  //     "module.exports = React.createClass({",
  //     "  render: function() {",
  //     "    return (",
  //     "      '<p>{{name}}</p>'",
  //     "    );",
  //     "  }",
  //     "});"
  //   ].join('\n');
  //
  //   var result = transform(code);
  //   var partial = transform(codePartial);
  //
  //   jest.setMock('partial_a', eval(partial.js));
  //   var mustachePartials = { 'partial_a': partial.mustache };
  //
  //   var rendered = render(result, { name: 'BAD', arr: [{ name: 'Nick' }, { name: 'Hello' }, { name: 'Goodbye' }]}, mustachePartials);
  //   expect(rendered.mustache).toEqual(rendered.react);
  // });

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
      "        '{{> partial_a something = {this.state.something} }}'+",
      "        '{{#this.props.arr}}'+",
      "          '{{> partial_a count={this.state.count}   something = {this.state.something} }}'+",
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

    jest.setMock('partial_a', eval(partial.js));
    var mustachePartials = { 'partial_a': partial.mustache };

    var rendered = render(result, { count: 7, something: 'Hello', arr: [{ name: 'One' }, { name: 'Two' }] }, mustachePartials);
    expect(rendered.mustache).toEqual(rendered.react);
  });
});

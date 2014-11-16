"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('jsxtache converts blocks', function() {
  var sharedCode = {
    peopleNoVar: [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '{{#this.props.people}}<p>Hello.</p>{{/this.props.people}}'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n'),
    peopleVar: [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '{{#this.props.people}}<p>Hello {{name}}.</p>{{/this.props.people}}'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n')
  };

  it('handles basic lists', function() {
    var code = sharedCode.peopleNoVar;
    var result = transform(code);
    expect(result.mustache).toMatch(/\{\{\#people/);
    var regexp = /\__mustacheBlock\.call\(/;
    expect(result.jsx).toMatch(regexp);
    expect(result.js).toMatch(regexp);
    var rendered = render(result, { people: ['one', 'two', 'three'] });
    var expected = '<div><p>Hello.</p><p>Hello.</p><p>Hello.</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles false values / empty lists', function() {
    var code = sharedCode.peopleNoVar;
    var result = transform(code);
    var renderedOne = render(result, { people: [] });
    var expected = '<div></div>';
    expect(renderedOne.mustache).toEqual(expected);
    expect(renderedOne.react).toEqual(expected);
    var renderedTwo = render(result, {});
    expect(renderedTwo.mustache).toEqual(expected);
    expect(renderedTwo.react).toEqual(expected);
  });

  it('handles collections with scope', function() {
    var code = sharedCode.peopleVar;
    var result = transform(code);
    var regexp = /\__mustacheBlock\.call\(.*\!\!scope/;
    expect(result.jsx).toMatch(regexp);
    expect(result.js).toMatch(regexp);
    var rendered = render(result, { people: [{ name: 'Nick' }, { name: 'John' }]});
    var expected = '<div><p>Hello Nick.</p><p>Hello John.</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles objects with scope', function() {
    var code = sharedCode.peopleVar;
    var result = transform(code);
    var rendered = render(result, { people: { name: 'Nick' }});
    var expected = '<div><p>Hello Nick.</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles non-list/non-object truthy/falsy values', function() {
    var code = sharedCode.peopleVar;
    var result = transform(code);
    var rendered = render(result, { people: 'Nick' });
    var expected = '<div><p>Hello .</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

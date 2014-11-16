"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('jsxtache converts variables', function() {
  it('handles props', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '<p>Hello {{this.props.name}}</p>'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    expect(result.mustache).toMatch(/\{\{name\}\}/);
    expect(result.jsx).toMatch(/this\.props\.name/);
    expect(result.js).toMatch(/this\.props\.name/);
    var rendered = render(result, { name: 'Nick' });
    var expected = '<div><p>Hello Nick</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles state', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  getInitialState: function() {",
      "    return { name: this.props.name };",
      "  },",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '<p>Hello {{this.state.name}}</p>'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    expect(result.mustache).toMatch(/\{\{name\}\}/);
    expect(result.jsx).toMatch(/this\.state\.name/);
    expect(result.js).toMatch(/this\.state\.name/);
    var rendered = render(result, { name: 'Nick' });
    var expected = '<div><p>Hello Nick</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  // this is useful for mustache blocks, where mustache compiles the following:
  // mustche.parse('{{#people}}{{something}}{{/people}}', {people: { something: 'hi' }, something: 'bye' }); >> hi
  // mustche.parse('{{#people}}{{something}}{{/people}}', {people: { hello: 'hi' }, something: 'bye' }); >> bye
  // @TODO
  it('handles unscoped variables', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '{{#this.props.people}}<p>Hello {{nameA}} -- {{nameB}} -- {{this.props.nameB}}</p>{{/this.props.people}}'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    expect(result.mustache).toMatch(/\{\{\#people\}\}.*\{nameA.*\{nameB.*\{nameB.*\{\/people/);
    var regexp = /\__mustacheBlock\.call\(/;
    expect(result.jsx).toMatch(regexp);
    expect(result.js).toMatch(regexp);
    var rendered = render(result, { people: [{ name: '1' }, { name: '2', nameA: 'Ca', nameB: 'Cb' }, { name: '3', nameB: 'Cb' }], nameA: 'Oa', nameB: 'Ob' });
    var expected = '<div><p>Hello Oa -- Ob -- Ob</p><p>Hello Ca -- Cb -- Cb</p><p>Hello Oa -- Cb -- Cb</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles unsafe variables', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '<p>Hello {{{this.props.name}}}</p>'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    expect(result.jsx).toMatch(/dangerouslySetInnerHTML\=\{\{\_\_html\:/);
    expect(result.mustache).toMatch(/\{\{\{.*\}\}\}/);
    var rendered = render(result, { name: '&middot;' });
    var expected = "<div><p>Hello <span>&middot;</span></p></div>";
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles unsafe variables (ampersand)', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>'+",
      "  '<p>Hello {{&this.props.name}}</p>'+",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    expect(result.jsx).toMatch(/dangerouslySetInnerHTML\=\{\{\_\_html\:/);
    expect(result.mustache).toMatch(/\{\{\{.*\}\}\}/);
    var rendered = render(result, { name: '&middot;' });
    var expected = "<div><p>Hello <span>&middot;</span></p></div>";
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

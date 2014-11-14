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
      "      '<div>'+",
      "        '<p>Hello {{this.props.name}}</p>'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var expected = {
      mustache: "<div><p>Hello {{name}}</p></div>",
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        '<div><p>Hello {!!(!!this.props && !!this.props.name) ? (this.props.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))}</p></div>',
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, React.createElement("p", null, "Hello ", !!(!!this.props && !!this.props.name) ? (this.props.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { name: 'Nick' });
    expect(rendered.mustache).toEqual(rendered.react);
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

    var expected = {
      mustache: "<div><p>Hello {{name}}</p></div>",
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  getInitialState: function() {",
        "    return { name: this.props.name };",
        "  },",
        "  render: function() {",
        "    return (",
        "<div><p>Hello {!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))}</p></div>",
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  getInitialState: function() {",
        "    return { name: this.props.name };",
        "  },",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, React.createElement("p", null, "Hello ", !!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { name: 'Nick' });
    expect(rendered.mustache).toEqual(rendered.react);
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
      "      '<div>'+",
      "        '{{#this.props.people}}<p>Hello {{nameA}} -- {{nameB}} -- {{this.props.nameB}}</p>{{/this.props.people}}'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var expected = {
      mustache: "<div>{{#people}}<p>Hello {{nameA}} -- {{nameB}} -- {{nameB}}</p>{{/people}}</div>",
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        '<div>{!!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (<p>Hello {!!(!!el && !!el.nameA) ? (el.nameA) : (!!(!!this.state && !!this.state.nameA) ? (this.state.nameA) : (!!(!!this.props && !!this.props.nameA) ? (this.props.nameA) : (null)))} -- {!!(!!el && !!el.nameB) ? (el.nameB) : (!!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null)))} -- {!!(!!el && !!el.nameB) ? (el.nameB) : (!!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null)))}</p>);    }.bind(this))  ) : (<p>Hello {!!(!!this.state && !!this.state.nameA) ? (this.state.nameA) : (!!(!!this.props && !!this.props.nameA) ? (this.props.nameA) : (null))} -- {!!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null))} -- {!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (!!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null)))}</p>  )) : (null)}</div>',
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, !!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (React.createElement("p", null, "Hello ", !!(!!el && !!el.nameA) ? (el.nameA) : (!!(!!this.state && !!this.state.nameA) ? (this.state.nameA) : (!!(!!this.props && !!this.props.nameA) ? (this.props.nameA) : (null))), " -- ", !!(!!el && !!el.nameB) ? (el.nameB) : (!!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null))), " -- ", !!(!!el && !!el.nameB) ? (el.nameB) : (!!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null)))));    }.bind(this))  ) : (React.createElement("p", null, "Hello ", !!(!!this.state && !!this.state.nameA) ? (this.state.nameA) : (!!(!!this.props && !!this.props.nameA) ? (this.props.nameA) : (null)), " -- ", !!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null)), " -- ", !!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (!!(!!this.state && !!this.state.nameB) ? (this.state.nameB) : (!!(!!this.props && !!this.props.nameB) ? (this.props.nameB) : (null))))  )) : (null))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { people: [{ name: '1' }, { name: '2', nameA: 'Ca', nameB: 'Cb' }, { name: '3', nameB: 'Cb' }], nameA: 'Oa', nameB: 'Ob' });
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('handles unsafe variables', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '<p>Hello {{{this.props.name}}}</p>'+",
      "      '</div>'",
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

  // it('handles unsafe variables (ampersand)', function() {
  //   var code = [
  //     "var React = require('react');",
  //     "module.exports = React.createClass({",
  //     "  render: function() {",
  //     "    return (",
  //     "      '<div>'+",
  //     "        '<p>Hello {{&this.props.name}}</p>'+",
  //     "      '</div>'",
  //     "    );",
  //     "  }",
  //     "});"
  //   ].join('\n');
  //
  //   var result = transform(code);
  //   expect(result).toEqual(expected);
  //   var rendered = render(result, { name: '&middot;' });
  //   expect(rendered.mustache).toEqual("<div><p>Hello &middot;</p></div>");
  //   expect(rendered.react).toEqual("<div><p>Hello <span>&middot;</span></p></div>");
  // });
});

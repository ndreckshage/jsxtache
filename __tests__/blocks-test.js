"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe('jsxtache converts sections', function() {
  var sharedCode = {
    peopleNoVar: [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '{{#this.props.people}}<p>Hello.</p>{{/this.props.people}}'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n'),
    peopleVar: [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '{{#this.props.people}}<p>Hello {{name}}.</p>{{/this.props.people}}'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n')
  };

  var sharedExpected = {
    mustache: {
      peopleNoVar: "<div>{{#people}}<p>Hello.</p>{{/people}}</div>",
      peopleVar: "<div>{{#people}}<p>Hello {{name}}.</p>{{/people}}</div>"
    },
    jsx: {
      peopleNoVar: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        '<div>{!!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (<p>Hello.</p>);    }.bind(this))  ) : (<p>Hello.</p>  )) : (null)}</div>',
        "    );",
        "  }",
        "});"
      ].join('\n'),
      peopleVar: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        '<div>{!!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (<p>Hello {!!(!!el && !!el.name) ? (el.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))}.</p>);    }.bind(this))  ) : (<p>Hello {!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null))}.</p>  )) : (null)}</div>',
        "    );",
        "  }",
        "});"
      ].join('\n')
    },
    js: {
      peopleNoVar: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, !!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (React.createElement("p", null, "Hello."));    }.bind(this))  ) : (React.createElement("p", null, "Hello.")  )) : (null))',
        "    );",
        "  }",
        "});"
      ].join('\n'),
      peopleVar: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, !!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (React.createElement("p", null, "Hello ", !!(!!el && !!el.name) ? (el.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null))), "."));    }.bind(this))  ) : (React.createElement("p", null, "Hello ", !!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)), ".")  )) : (null))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }
  }

  it('handles basic lists', function() {
    var code = sharedCode.peopleNoVar;
    var expected = {
      mustache: sharedExpected.mustache.peopleNoVar,
      jsx: sharedExpected.jsx.peopleNoVar,
      js: sharedExpected.js.peopleNoVar
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { people: ['one', 'two', 'three'] });
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('handles false values / empty lists', function() {
    var code = sharedCode.peopleNoVar;
    var expected = {
      mustache: sharedExpected.mustache.peopleNoVar,
      jsx: sharedExpected.jsx.peopleNoVar,
      js: sharedExpected.js.peopleNoVar
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var renderedOne = render(result, { people: [] });
    expect(renderedOne.mustache).toEqual(renderedOne.react);
    var renderedTwo = render(result, {});
    expect(renderedTwo.mustache).toEqual(renderedTwo.react);
  });

  it('handles collections with scope', function() {
    var code = sharedCode.peopleVar;
    var expected = {
      mustache: sharedExpected.mustache.peopleVar,
      jsx: sharedExpected.jsx.peopleVar,
      js: sharedExpected.js.peopleVar
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { people: [{ name: 'Nick' }, { name: 'John' }]});
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('handles objects with scope', function() {
    var code = sharedCode.peopleVar;
    var expected = {
      mustache: sharedExpected.mustache.peopleVar,
      jsx: sharedExpected.jsx.peopleVar,
      js: sharedExpected.js.peopleVar
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { people: { name: 'Nick' }});
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('handles non-list/non-object truthy/falsy values', function() {
    var code = sharedCode.peopleVar;
    var expected = {
      mustache: sharedExpected.mustache.peopleVar,
      jsx: sharedExpected.jsx.peopleVar,
      js: sharedExpected.js.peopleVar
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { people: 'Nick' });
    expect(rendered.mustache).toEqual(rendered.react);
  });
});

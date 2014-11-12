"use strict";
jest.autoMockOff();

// @TODO refactor this

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');
var mustache = require('mustache');
var React = require('react');

describe('jsxtache mustache template', function() {
  it('defers to mustache method', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  mustache: function() {",
      "    return (",
      "      '<div>' +",
      "        '<p>Hello {{name}}</p>' +",
      "      '</div>'",
      "    );",
      "  },",
      "  render: function() {",
      "    return (",
      "      '<div>' +",
      "        '<p>Hello {this.props.name}</p>' +",
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
        "  ",
        "  render: function() {",
        "    return (",
        "<div><p>Hello {this.props.name}</p></div>",
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  ",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, React.createElement("p", null, "Hello ", this.props.name))',
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
});

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

  it('handles unescaped variables', function() {
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

    var expected = {
      mustache: "<div><p>Hello {{{name}}}</p></div>",
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        "<div><p>Hello <span dangerouslySetInnerHTML={{__html: this.props.name}} /></p></div>",
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, React.createElement("p", null, "Hello ", React.createElement("span", {dangerouslySetInnerHTML: {__html: this.props.name}})))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { name: '&middot;' });
    expect(rendered.mustache).toEqual("<div><p>Hello &middot;</p></div>");
    expect(rendered.react).toEqual("<div><p>Hello <span>&middot;</span></p></div>");
  });

  it('handles unescaped variables (ampersand)', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '<p>Hello {{&this.props.name}}</p>'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var expected = {
      mustache: "<div><p>Hello {{{name}}}</p></div>",
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        "<div><p>Hello <span dangerouslySetInnerHTML={{__html: this.props.name}} /></p></div>",
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, React.createElement("p", null, "Hello ", React.createElement("span", {dangerouslySetInnerHTML: {__html: this.props.name}})))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { name: '&middot;' });
    expect(rendered.mustache).toEqual("<div><p>Hello &middot;</p></div>");
    expect(rendered.react).toEqual("<div><p>Hello <span>&middot;</span></p></div>");
  });
});

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

describe('jsxtache converts inverted sections', function() {
  it('handles inverted sections', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '{{#this.props.people}}<p>Hello.</p>{{/this.props.people}}'+",
      "        '{{^this.props.people}}<p>Goodbye.</p>{{/this.props.people}}'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var renderedOne = render(result, { people: true });
    expect(renderedOne.mustache).toEqual(renderedOne.react);
    var renderedTwo = render(result, { people: false });
    expect(renderedTwo.mustache).toEqual(renderedTwo.react);
    var renderedThree = render(result, { people: [] });
    expect(renderedThree.mustache).toEqual(renderedThree.react);
    var renderedFour = render(result, { people: {} });
    expect(renderedFour.mustache).toEqual(renderedFour.react);
    var renderedFive = render(result, { people: [{ hello: 'test' }, { hello: 'something' }] });
    expect(renderedFive.mustache).toEqual(renderedFive.react);
    var renderedSix = render(result, { missingKey: {} });
    expect(renderedSix.mustache).toEqual(renderedSix.react);
    var renderedSeven = render(result, { people: 'some text' });
    expect(renderedSeven.mustache).toEqual(renderedSeven.react);
    var renderedEight = render(result, { people: '' });
    expect(renderedEight.mustache).toEqual(renderedEight.react);
    var renderedNine = render(result, { people: 0 });
    expect(renderedNine.mustache).toEqual(renderedNine.react);
    var renderedTen = render(result, { people: 10 });
    expect(renderedTen.mustache).toEqual(renderedTen.react);
  });
});

describe('jsxtache handles comments', function() {
  it('handles comments', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>{{!ignore me}}</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { people: true });
    expect(rendered.mustache).toEqual(rendered.react);
  });
});

describe("jsx specific signifiers", function() {
  it('handles collection keys', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '{{#this.props.people}}<p{{`key`}}>Hello.</p>{{/this.props.people}}'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var expected = {
      mustache: "<div>{{#people}}<p>Hello.</p>{{/people}}</div>",
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        '<div>{!!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (<p key={ndx}>Hello.</p>);    }.bind(this))  ) : (<p key={ndx}>Hello.</p>  )) : (null)}</div>',
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, !!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (React.createElement("p", {key: ndx}, "Hello."));    }.bind(this))  ) : (React.createElement("p", {key: ndx}, "Hello.")  )) : (null))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
  });

  it('handles jsx properties', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div>'+",
      "        '{{#this.props.people}}<p{{`onClick={this._onClick}`}}>Click Me.</p>{{/this.props.people}}'+",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var expected = {
      mustache: "<div>{{#people}}<p>Click Me.</p>{{/people}}</div>",
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        '<div>{!!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (<p onClick={this._onClick}>Click Me.</p>);    }.bind(this))  ) : (<p onClick={this._onClick}>Click Me.</p>  )) : (null)}</div>',
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", null, !!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (React.createElement("p", {onClick: this._onClick}, "Click Me."));    }.bind(this))  ) : (React.createElement("p", {onClick: this._onClick}, "Click Me.")  )) : (null))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
  });
});

describe("jsxstache specific signifiers", function() {
  it('handles css classes', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div {{*' +",
      "        'class={' +",
      "           '\"something\":\"this.props.something\",' +",
      "           '\"another\": true' +",
      "         '}' +",
      "       '*}}>' +",
      "        '<p>Hello</p>' +",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var expected = {
      mustache: '<div class="{{#something}} something{{/something}} another"><p>Hello</p></div>',
      jsx: [
        "var React = require('react');",
        "module.exports = React.createClass({",
        "  render: function() {",
        "    return (",
        '<div className={"" + (!!this.props.something ? " something" : "") + (!!true ? " another" : "")}><p>Hello</p></div>',
        "    );",
        "  }",
        "});"
      ].join('\n'),
      js: [
        "var React = require('react');",
        "module.exports = React.createClass({displayName: 'exports',",
        "  render: function() {",
        "    return (",
        'React.createElement("div", {className: "" + (!!this.props.something ? " something" : "") + (!!true ? " another" : "")}, React.createElement("p", null, "Hello"))',
        "    );",
        "  }",
        "});"
      ].join('\n')
    }

    var result = transform(code);
    expect(result).toEqual(expected);
    var rendered = render(result, { something: true });
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('handles css classes with inverse', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div {{*' +",
      "        'class={' +",
      "           '\"something\":\"!!!!!!!this.props.something\",' +",
      "           '\"something-else\":\"!!this.props.hello\",' +",
      "           '\"hello\":\"!this.props.hello\",' +",
      "           '\"goodbye\": false,' +",
      "           '\"another\": true' +",
      "         '}' +",
      "       '*}}>' +",
      "        '<p>Hello</p>' +",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: false, hello: true });
    expect(rendered.mustache).toEqual(rendered.react);
  });

  it('handles id, src, data- etc', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "      '<div {{*' +",
      "        'class={' +",
      "           '\"another\": true' +",
      "         '}' +",
      "         '      id={this.props.something}' +",
      "         '      data-something={this.props.something}' +",
      "         '      src={\"hello\"}' +",
      "       '*}}>' +",
      "        '<p>Hello</p>' +",
      "      '</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: 'smile', hello: 'other' });
    expect(rendered.mustache).toEqual(rendered.react);
  });
});

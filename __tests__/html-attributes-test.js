"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

describe("jsxstache handles html attributes", function() {
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

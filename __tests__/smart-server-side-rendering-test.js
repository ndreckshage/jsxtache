"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/smart-server-side-render');

// @TODO this should be done automatically with a forked version of esprima

describe("smart server side rendering", function() {
  it('leaves in mustache opening + closing tag signifiers for mustache', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div{{%o}}>'+",
      "  '{{#this.props.people}}'+",
      "    '<p{{%o}}>'+",
      "      '<span{{%o}}>Hello.</span{{%c}}>'+",
      "    '</p{{%c}}>'+",
      "  '{{/this.props.people}}'+",
      "'</div{{%c}}>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { people: ['one', 'two']});
    console.log(rendered);
  });
});

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
      "'<div {{*' +",
      "'  class:\\n'+",
      "'    \"something\": this.props.something\\n'+",
      "'    \"another\": true\\n'+",
      "'*}}>' +",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: true });
    var expected = '<div class=" something another"><p>Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('separates element from attribute if someone forgets', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div{{*' +",
      "'  class:\\n'+",
      "'    \"something\": this.props.something\\n'+",
      "'    \"another\": true\\n'+",
      "'*}}>' +",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: true });
    var expected = '<div class=" something another"><p>Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles simple css class assignment', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div {{*\\n' +",
      "'  class: this.props.something + \"-more\"\\n'+",
      "'*}}>' +",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: "smile" });
    var expected = '<div class="smile-more"><p>Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles indented elements + extra whitespace', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div>' +",
      "'  <p {{*      \\n' +",
      "'    class:\\n'+",
      "'      \"massachusetts\": this.props.something\\n'+",
      "'      \"another\": true\\n'+",
      "'  *}}>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: true });
    var expected = '<div>  <p class=" massachusetts another">Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles css classes w single/dbl quotes', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div {{*' +",
      "'  class:\\n'+",
      "'    \"something\": this.props.something\\n'+",
      "'    \\'another\\': true\\n'+",
      "'*}}>' +",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: true });
    var expected = '<div class=" something another"><p>Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });


  it('handles css classes with inverse', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div {{*' +",
      "'  class:\\n'+",
      "'    \"something\": !!!!!!!this.props.something\\n'+",
      "'    \"something-else\": !!this.props.hello\\n'+",
      "'    \"hello\": !this.props.hello\\n'+",
      "'    \"goodbye\": false\\n'+",
      "'    \"another\": true\\n'+",
      "'*}}>'+",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: false, hello: true });
    var expected = '<div class=" something something-else another"><p>Hello</p></div>'
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles css classes no matter how crazy they get', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div {{*' +",
      "'  className:\\n'+",
      "'    \"hello\": true\\n'+",
      "'    \"hi goodbye ok\": true\\n'+",
      "'    this.props.something: true\\n'+",
      "'    this.props.something + \"-a\": true\\n'+",
      "'    \"b-\" + this.props.something: true\\n'+",
      "'    this.props.something + \"-c\": !!!!!!!!this.props.something\\n'+",
      "'    this.props.something + \"-d\": !!!!!!!this.props.something\\n'+",
      "'    this.props.something + this.props.something_else: true\\n'+",
      "'    this.props.something_else + this.props.something: false\\n'+",
      "'*}}>'+",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { something: 'yyy', something_else: 'ooo' });
    var expected = '<div class=" hello hi goodbye ok yyy yyy-a b-yyy yyy-c yyyooo"><p>Hello</p></div>';
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });

  it('handles id, src, data- etc', function() {
    var code = [
      "var React = require('react');",
      "module.exports = React.createClass({",
      "  render: function() {",
      "    return (",
      "'<div {{*\\n' +",
      "'  id: this.props.element_id\\n'+",
      "'  class:\\n'+",
      "'    \"something\": true\\n'+",
      "'    \"something-else\": true\\n'+",
      "'  src: this.props.element_src\\n'+",
      "'  data-something: \"something\"\\n'+",
      "'  data-something-else:\\n'+",
      "'    \"something\": true\\n'+",
      "'    \"something-else\": true\\n'+",
      "'*}}>'+",
      "  '<p>Hello</p>' +",
      "'</div>'",
      "    );",
      "  }",
      "});"
    ].join('\n');

    var result = transform(code);
    var rendered = render(result, { element_id: 'iddd', element_src: 'srcc' });
    var expected = '<div id="iddd" class=" something something-else" src="srcc" data-something="something" data-something-else=" something something-else"><p>Hello</p></div>'
    expect(rendered.mustache).toEqual(expected);
    expect(rendered.react).toEqual(expected);
  });
});

"use strict";
jest.autoMockOff();

var transform = require('./../src/jsxtache');
var render = require('./../__helpers__/render');

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

/**
 * @flow
 */

var React = require('react');

function something(name: string, num: number): string {
  return name + num.toString();
}

module.exports = React.createClass({
  render: function(): any {
    return;
  },

  onClick: function() {
    something('hello', 13);
  }
});

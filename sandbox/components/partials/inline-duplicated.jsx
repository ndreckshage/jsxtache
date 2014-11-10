var React = require('react');
module.exports = React.createClass({
  mustache: function() {
    return (
      '<div>' +
        '<p>Hello {{name}}!</p>' +
      '</div>'
    );
  },
  render: function() {
    return (
      '<div>' +
        '<p>Hello!</p>' +
      '</div>'
    );
  }
});

var React = require('react');
module.exports = React.createClass({
  render: function() {
    return (
      '<div>' +
        '<p>Hello {{this.props.name}}</p>' +
      '</div>'
    );
  }
});

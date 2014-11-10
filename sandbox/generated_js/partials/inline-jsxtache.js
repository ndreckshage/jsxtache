var React = require('react');
module.exports = React.createClass({displayName: 'exports',
  render: function() {
    return (
React.createElement("div", null, React.createElement("p", null, "Hello ", !!(!!this.props && !!this.props.name) ? (this.props.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))))
    );
  }
});

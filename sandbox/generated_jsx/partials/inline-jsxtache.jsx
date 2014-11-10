var React = require('react');
module.exports = React.createClass({
  render: function() {
    return (
<div><p>Hello {!!(!!this.props && !!this.props.name) ? (this.props.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))}</p></div>
    );
  }
});

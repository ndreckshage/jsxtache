var PartialsHello = require('partials/hello');
var React = require('react');
module.exports = React.createClass({displayName: 'exports',
  render: function() {
    return (
React.createElement("div", {id: 'element-id'}, 
React.createElement(PartialsHello, React.__spread({},  this.props)), !!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (    React.createElement("div", {key: ndx}, 
      React.createElement("p", {id:  '' + ((!!element_id) ? (element_id) : ('')), className: (" " + "something")+(!!b_show_class ? (" " + "something-else") : "")}, !!(!!el && !!el.name) ? (el.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null))))
    )
);    }.bind(this))  ) : (    React.createElement("div", {key: ndx}, 
      React.createElement("p", {id:  '' + ((!!element_id) ? (element_id) : ('')), className: (" " + "something")+(!!b_show_class ? (" " + "something-else") : "")}, !!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))
    )
  )) : (null), !this.props.people || !!(toString.call(this.props.people) === "[object Array]" && this.props.people.length === 0) ? (    React.createElement("span", {onHover: this._onHover}, "No People")
) : (null), "  ", React.createElement("span", {onClick: this._onClick}, !!(!!this.props && !!this.props.testing) ? (this.props.testing) : (!!(!!this.state && !!this.state.testing) ? (this.state.testing) : (!!(!!this.props && !!this.props.testing) ? (this.props.testing) : (null))))
)
);
  },
  _onClick: function() {
    alert(1);
  },
  _onHover: function() {
    alert(2);
  }
});

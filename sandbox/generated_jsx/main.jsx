var PartialsHello = require('partials/hello');
var React = require('react');
module.exports = React.createClass({
  render: function() {
    return (
<div id={'element-id'}>
<PartialsHello {...this.props} />{!!this.props.people ? (  v = this.props.people,  toString.call(v) === "[object Object]" ? (v = [v]) : (null),  toString.call(v) === "[object Array]" ? (    v.map(function(el, ndx) {      return (    <div  key={ndx}>
      <p id={this.props.element_id} className={"" + (!!true ? " something" : "") + (!!this.props.b_show_class ? " something-else" : "")}>{!!(!!el && !!el.name) ? (el.name) : (!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null)))}</p>
    </div>
);    }.bind(this))  ) : (    <div  key={ndx}>
      <p id={this.props.element_id} className={"" + (!!true ? " something" : "") + (!!this.props.b_show_class ? " something-else" : "")}>{!!(!!this.state && !!this.state.name) ? (this.state.name) : (!!(!!this.props && !!this.props.name) ? (this.props.name) : (null))}</p>
    </div>
  )) : (null)}{!this.props.people || !!(toString.call(this.props.people) === "[object Array]" && this.props.people.length === 0) ? (    <span  onHover = {this._onHover}>No People</span>
) : (null)}  <span  onClick = {this._onClick}>{!!(!!this.props && !!this.props.testing) ? (this.props.testing) : (!!(!!this.state && !!this.state.testing) ? (this.state.testing) : (!!(!!this.props && !!this.props.testing) ? (this.props.testing) : (null)))}</span>
</div>
);
  },
  _onClick: function() {
    alert(1);
  },
  _onHover: function() {
    alert(2);
  }
});

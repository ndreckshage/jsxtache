var React=require('react');module.exports=React.createClass({displayName: 'exports',render:function(){return (
React.createElement("div", null, 
  React.createElement("p", null, 
    "Hello ", !!(!!this.props && !!this.props.there) ? (this.props.there) : (!!(!!this.state && !!this.state.there) ? (this.state.there) : (!!(!!this.props && !!this.props.there) ? (this.props.there) : (null)))
  )
)
);}});
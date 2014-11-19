var React=require('react');module.exports=React.createClass({render:function(){return (
<div>
  <p>
    Hello {!!(!!this.props && !!this.props.there) ? (this.props.there) : (!!(!!this.state && !!this.state.there) ? (this.state.there) : (!!(!!this.props && !!this.props.there) ? (this.props.there) : (null)))}
  </p>
</div>
);}});
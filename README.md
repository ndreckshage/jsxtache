#EXPERIMENTAL! DON'T USE!

###jsxtache

Write React components with Mustache. Generate a Mustache version (for server) + JSX version (for client). *For use when JS on server is not possible, but Mustache is.*

```
npm install -g jsxtache
```

######Why?

Because [React](http://facebook.github.io/react/) is awesome. But JS on the server is a tough argument. This dumbs down React to Mustache's level, so that it can cross-compile into both.

######Can I take advantage of React's *smart* server side rendering?

Not yet. It will be able to by marking open / close tags with {{%o}}/{{%c}}, and building that in to your servers Mustache rendering engine [like this](https://github.com/ndreckshage/mustache.js/commit/825f673cf6317240ae92e07a852dc531985ae207).

######Syntax

*JSX (.jsx)*
```jsx
var React = require('react');
module.exports = React.createClass({
  render: function() {
    return;
  },
  _onClick: function() {
    alert(1);
  },
  _onHover: function() {
    alert(2);
  }
});

```

*Matching JSXtache (.jsx.mustache)*
```mustache
<div {{** id = {'element-id'} **}}>
  {{> partials/hello}}
  {{#this.props.people}}
    <div {{** key **}}>
      <p {{*
        id: element_id + "_id"
        className:
          "something": true
          "something-else": b_show_class
      *}}>{{name}}</p>
    </div>
  {{/this.props.people}}
  {{^this.props.people}}
    <span {{** onHover = {this._onHover} **}}>No People</span>
  {{/this.props.people}}
  <span {{** onClick = {this._onClick} **}}>{{this.props.testing}}</span>
</div>

```

######Project Structure

There are a few options for coordinating JSX / JSXtache. JSXtache syntax can be used, or this can manage duplication between mustache + JSX.

Manage Duplication:
- .jsx file; render + mustache method; inline jsx + mustache
- .jsx file + .mustache file; inline jsx, implicit mustache

JSXtache syntax:
- .jsx file -- render method -- inline jsxtache
- .jsx file + .jsx.mustache file; implicit jsxtache

*Example*
```
components/
components/component.jsx
components/component.jsx.mustache
components/partials/
components/partials/one.jsx
components/partials/one.mustache
components/partials/two.jsx
```

######CLI

Cross-compiles the strcuture from above into specified mustache / JSX / JS directories.

```bash
jsxtache <jsxtache dir> <options...>
  --mustache (Default: null)
  --jsx (Default: null)
  --js (Default: null)
  --mustache-out-ext (Default: .mustache)
  --jsx-out-ext (Default: .jsx)
  --js-out-ext (Default: .js)
  --mustache-filename-append (Default: "")
  --jsx-filename-append (Default: "")
  --js-filename-append (Default: "")
jsxtache help
jsxtache version
```

*Example*
```bash
jsxtache app/components --mustache app/mustache --js app/js
```

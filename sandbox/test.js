var transform = require('./../index');
var render = require('./../__helpers__/render');
var fs = require('fs');

var jsx = fs.readFileSync('./components/main.jsx', 'utf-8');
var jsxtache = fs.readFileSync('./components/main.jsx.mustache', 'utf-8');

var result = transform(jsx, jsxtache);
// console.log(result.mustache);
// console.log(result.jsx)

// var rendered = render(result, { arr: { something: 'hello' }});
var rendered = render(result, { arr: [{parta: 'something', partb: '.com'},{parta: 'else', partb: '.org'}]});
console.log(rendered);
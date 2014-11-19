var transform = require('./../index');
var render = require('./../__helpers__/render');
var fs = require('fs');

// var jsx = fs.readFileSync('./components/main.jsx', 'utf-8');
var jsxtache = fs.readFileSync('./components/main.jsx.mustache', 'utf-8');

var result = transform(null, jsxtache);
// console.log(result.mustache);
// console.log(result.jsx)

// var rendered = render(result, { b_show_arr: true, arr: { something: 'hello' }});
// var rendered = render(result, { b_show_arr: true, arr: [{parta: 'something', partb: '.com'},{parta: 'else', partb: '.org'}]});
var rendered = render(result, { there: 'there' })
console.log(rendered);

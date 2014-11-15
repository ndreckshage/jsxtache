"use strict";

// @TODO REFACTOR! C0DE IZ RUFF.
// @TODO gotta work on dev friendliness + error handling. compiliation failures aren't pretty.

var esprima = require('esprima');
var lodash = require('lodash');
var tokenize = require('mustache').parse;
var reactTools = require('react-tools');
var chalk = require('chalk');
var utility = require('./utility');
var isReactSpecific = require('./react-specific-signifiers');

var MUSTACHE_TAGS = ['{{','}}'];
var JSX_TAGS = ['{','}'];
var JSX_SPREAD = '...';

var PREFIX_MUSTACHE_PARTIAL = '';

var JSXTACHE_SIGNIFIER = '*';

var requirePartials = [];

/**
 * traverse esprima / AST syntax tree
 */
function traverse(root) {
  var list = {};

  /**
   *
   */
  function _traverse(node, parent) {
    if (!node || typeof node.type !== 'string') {
      return;
    } else {
      // @TODO this shouldnt be in this function
      if (!!node.key && !!node.value && node.value.type === 'FunctionExpression') {
        if (node.key.name === 'mustache') {
          list.mustache = node.range;
          try {
            list.mustacheReturn = node.value.body.body[0].range;
          } catch (e) {
            list.mustacheReturn = null;
          }
          try {
            list.mustacheReturnBlock = node.value.body.body[0].argument.range;
          } catch (e) {
            list.mustacheReturnBlock = null;
          }
        } else if (node.key.name === 'render') {
          list.render = node.range;
          try {
            list.renderReturn = node.value.body.body[0].range;
          } catch (e) {
            list.renderReturn = null;
          }
          try {
            list.renderReturnBlock = node.value.body.body[0].argument.range;
          } catch (e) {
            list.renderReturnBlock = null;
          }
        }
      }
    }

    for (var prop in node) {
      var child = node[prop];
      if (Array.isArray(child)) {
        for (var i = 0, l = child.length; i < l; i++) {
          _traverse(child[i], node);
        }
      } else {
        _traverse(child, node)
      }
    }
  }

  _traverse(root, null);
  return list;
}

/**
 *
 */
function renderReplace(jsx, jsxRender) {
  return jsx.replace(/([^\S\n]*)\'\~\~JSX\~\~\'/, jsxRender);
}

/**
 *
 */
function replacePropsAndState(value) {
  return value.replace('this.props.', '').replace('this.state.', '').replace(/\!/g, '');
}

/**
 *
 */
function handleMustacheName(value) {
  return MUSTACHE_TAGS[0] + replacePropsAndState(value) + MUSTACHE_TAGS[1];
}

/**
 * @TODO need to think what to do with unsafe tag better. this is to match JSX.
 */
function handleMustacheUnsafe(value) {
  return '<span>' + MUSTACHE_TAGS[0] + JSX_TAGS[0] + replacePropsAndState(value) + JSX_TAGS[1] + MUSTACHE_TAGS[1] + '</span>';
}

/**
 * mustache scope will fail silently
 * and handles scope in a crazy way. so lets get creative
 * !!el.name ? (el.name) : (!!this.state.name ? (this.state.name) : (!!this.props.name ? (this.props.name) : (null)))
 * @TODO should check each object for truthy rather than just scope
 */
function handleJSXName(value, scope, removePropsState) {
  var safeValue = '', closingParentheses = '';
  var scopeScanner = [];

  if (!!removePropsState) {
    value = replacePropsAndState(value);
  }

  var explicitScope = value.split('.').length > 1;
  if (!!explicitScope) {
    scope = value.split('.');
    value = scope.pop();
    scopeScanner.push(scope.join('.'));
    scope = null;
  }

  scopeScanner.push('this.state', 'this.props');
  if (!!scope) {
    scopeScanner.unshift(scope);
  }

  // console.log('scopeScanner',scopeScanner, scope, value, '\n')

  scopeScanner.forEach(function(scope) {
    safeValue += ('!!(!!' + scope + ' && !!' + scope + '.' + value + ') ? (' + scope + '.' + value + ') : (');
    closingParentheses += ')';
  });

  safeValue += ('null' + closingParentheses);
  return JSX_TAGS[0] + safeValue + JSX_TAGS[1];
}

/**
 *
 */
function isJSXtacheKey(key) {
  return !!key &&
      key.charAt(0) === JSXTACHE_SIGNIFIER &&
      key.charAt(key.length - 1) === JSXTACHE_SIGNIFIER;
}

/**
 *
 */
function adjustIdentifier(identifier, signifier, yaml) {
  if (identifier.slice(0, signifier.length) === signifier) {
    identifier = identifier.slice(signifier.length);
  }
  if (identifier.slice(identifier.length - signifier.length) === signifier) {
    identifier = identifier.substring(0, identifier.length - signifier.length);
  }
  if (yaml) {
    identifier = identifier.split(/\n/);
    identifier = lodash.reject(identifier, function(n) {
      return !n.match(/[^\s\\]/);
    });
    return identifier;
  } else {
    return identifier.replace(/(^\s*|\s*$)/g, '');
  }
}

/**
 *
 */
function formatJSXtacheExpressionObject(expression, compileForMustache) {
  var str = '';
  for (var prop in expression) {
    if (!!expression.hasOwnProperty(prop)) {
      str += formatJSXtacheExpression(prop, expression[prop], compileForMustache);
    }
  }
  return str;
}

/**
 *
 */
function formatJSXtacheExpression(key, value, compileForMustache) {
  key = getJSXtacheSubExpressionArray(key);
  var str = '';
  value = utility.trim(value);
  if (value !== 'false') {
    if (!!compileForMustache) {
      var inverse = value.split(/\!/g).length % 2 === 0;
      value = replacePropsAndState(value);
      var fullKey = formatJSXtacheSubExpressionForMustache(key);
      if (value === 'true') {
        fullKey = ' ' + fullKey;
      } else {
        fullKey = (MUSTACHE_TAGS[0] + (!!inverse ? '^' : '#') + value + MUSTACHE_TAGS[1] + ' ' + fullKey + MUSTACHE_TAGS[0] + '/' + value + MUSTACHE_TAGS[1]);
      }
      str += fullKey;
    } else {
      var fullKey = formatJSXtacheSubExpressionForJSX(key);
      if (value === 'true') {
        fullKey = '(" " + ' + fullKey + ')';
      } else {
        fullKey = '(!!' +  value + ' ? (" " + ' + fullKey + ') : \"\")';
      }
      str += fullKey;
    }
  }
  return str;
}

/**
 *
 */
function getJSXtacheSubExpressionArray(key) {
  key = utility.trim(key);
  key = key.split('+');
  return key.map(function (subKey) {
    return utility.trim(subKey);
  });
}

/**
 *
 */
function formatJSXtacheSubExpressionForMustache(key) {
  var fullKey = '';
  key.forEach(function(subKey) {
    if (utility.startsWithQuotes(subKey)) {
      subKey = utility.removeQuotes(subKey);
    } else {
      subKey = MUSTACHE_TAGS[0] + replacePropsAndState(subKey) + MUSTACHE_TAGS[1];
    }
    fullKey += subKey;
  });
  return fullKey;
}

/**
 *
 */
function formatJSXtacheSubExpressionForJSX(key) {
  var fullKey = '';
  key.forEach(function(subKey) {
    if (!utility.startsWithQuotes(subKey)) {
      var joined = '';
      var safeKey = subKey.split('.').map(function(el) {
        joined += (joined === '' ? '' : '.');
        joined += el;
        return '!!' + joined;
      }).join('&&');
      subKey = ' \'\' + ((' + safeKey + ') ? (' + subKey + ') : (\'\'))';
    }
    if (fullKey !== '') {
      fullKey += '+';
    }
    fullKey += subKey;
  });
  return fullKey;
}

/**
 * yamlish
 */
function handleJSXtache(baseExpression, compileForMustache) {
  var rawExpressions = adjustIdentifier(baseExpression, JSXTACHE_SIGNIFIER, true);
  var expressions = convertRawExpressionsToExpressions(rawExpressions);
  var result = '';
  for (var expression in expressions) {
    if (!!expressions.hasOwnProperty(expression)) {
      var formatted = '';
      if (isReactSpecific(expression)) {
        if (!compileForMustache) {
          formatted = handleJSXSpecificKey(expression, expressions[expression]);
        }
      } else {
        formatted = handleJSXMustacheKey(expression, expressions[expression], compileForMustache);
      }

      if (formatted !== '') {
        var space = result === '' ? '' : ' ';
        result += (space + formatted);
      }
    }
  }

  return result;
}

/**
 *
 */
function handleJSXSpecificKey(key, value) {
  key = !!key ? utility.trim(key) : key;
  value = !!value ? utility.trim(value) : value;
  if (key === 'key') {
    if (value === 'true') {
      value = 'ndx';
    } else {
      value = 'scope.' + value;
    }
  }
  var formatted = key + '=' + JSX_TAGS[0] + value + JSX_TAGS[1];
  return formatted;
}

/**
 *
 */
function handleJSXMustacheKey(key, value, compileForMustache) {
  switch (key) {
  case 'class':
  case 'className':
    key = !!compileForMustache ? 'class' : 'className';
    break;
  default:
    // as is
  }

  var combined = '';
  if (lodash.isArray(value)) {
    value.forEach(function(subExpression) {
      subExpression = formatJSXtacheExpressionObject(subExpression, compileForMustache);
      if (combined !== '' && subExpression !== '' && !compileForMustache) {
        combined += '+';
      }
      combined += subExpression;
    });
  } else if (lodash.isString(value)) {
    var subExpression = getJSXtacheSubExpressionArray(value);
    if (!!compileForMustache) {
      combined = formatJSXtacheSubExpressionForMustache(subExpression);
    } else {
      combined = formatJSXtacheSubExpressionForJSX(subExpression);
    }
  }

  return key + '=' + (!!compileForMustache ? ('\"' + combined + '\"') : ('{' + combined + '}'));
}

/**
 *
 */
function convertRawExpressionsToExpressions(rawExpressions) {
  var expressions = {};
  var previousWhiteSpace = null;
  var parentKey = null;

  rawExpressions.forEach(function(rawExpression) {
    var whiteSpace = rawExpression.match(/^(\s*)/)[0].length;
    var nest = !!previousWhiteSpace && whiteSpace > previousWhiteSpace;
    var breakNest = !!previousWhiteSpace && whiteSpace < previousWhiteSpace;
    if (!!breakNest) {
      parentKey = null;
    }
    var parts = rawExpression.split(':');
    var key = utility.trim(parts[0]);
    var value = !!parts[1] ? parts[1] : [];
    if (!!parentKey) {
      var obj = {};
      obj[key] = value;
      expressions[parentKey].push(obj);
    } else {
      expressions[key] = value;
    }
    previousWhiteSpace = whiteSpace;
    if (lodash.isArray(value)) {
      parentKey = key;
    }
  });

  return expressions;
}

/**
 *
 */
function handleJSXUnsafe(value) {
  // @TODO in order for markup to be the same, wed have to create span tag for mustache as well.
  // @TODO not sure best way of handling {{{raw}}} since react handles in pretty different way.
  return '<span dangerouslySetInnerHTML=' + MUSTACHE_TAGS[0] + '__html: ' + value + MUSTACHE_TAGS[1] + ' />';
}

/**
 *
 */
function handleMustacheBlock(value, children, inverse) {
  value = replacePropsAndState(value);
  var key = !inverse ? '#' : '^';
  var str = MUSTACHE_TAGS[0] + key + value + MUSTACHE_TAGS[1];
  if (!!children && !!lodash.isArray(children)) {
    str = crossCompile(str, null, children).mustache;
  }
  str += MUSTACHE_TAGS[0] + '/' + value + MUSTACHE_TAGS[1];
  return str;
}

/**
 * @TODO improve? pull into an injected function in each file etc
 * this is a bit crazy looking. but mustache blocks do a lot + need to account for arrays, objects, truthy / falsy
 * accomplishes inline in JSX expression {} without needing a var (which would need additional buffer to inject outside of return)
 * or unintentionally rewriting props. also does cross browser isArray / isObject checks without lodash / underscore
 * (since we cant rely on dependencies for code that can be injected anywhere)
 *
 * ends up looking something like this -->
 *
 * {!!this.props.something ? (
 *   v = this.props.something,
 *   toString.call(v) === '[object Object]' ? (v = [v]) : (null),
 *   toString.call(v) === '[object Array]' ? (
 *     v.map(function(scope, ndx) {
 *       return <p key={ndx}>{scope.name}</p>;
 *     })
 *   ) : (
 *     <p>{name}</p>
 *   )
 * ) : (null)}
 */
function handleJSXBlock(value, children) {
  var str = JSX_TAGS[0] + "!!" + value + " ? (" +
  "  v = " + value + "," +
  "  toString.call(v) === \"[object Object]\" ? (v = [v]) : (null)," +
  "  toString.call(v) === \"[object Array]\" ? (" +
  "    v.map(function(scope, ndx) {" +
  "      return (";

  if (!!children && !!lodash.isArray(children)) {
    str = crossCompile(null, str, children, 'scope', true).jsx;
  }

  str += ");" +
  "    }.bind(this))" +
  "  ) : (";

  if (!!children && !!lodash.isArray(children)) {
    str = crossCompile(null, str, children).jsx;
  }

  str += "  )" +
  ") : (null)" + JSX_TAGS[1];

  // console.log(str, '\n')

  return str;
}

function handleJSXInverse(value, children) {
  var str = JSX_TAGS[0] + "!" + value + " || !!(toString.call(" + value + ") === \"[object Array]\" && " + value + ".length === 0) ? (";
  if (!!children && !!lodash.isArray(children)) {
    str = crossCompile(null, str, children).jsx;
  }
  str += (") : (null)" + JSX_TAGS[1]);
  return str;
}

/**
 *
 */
function transformJSXtache(jsxtache) {
  var mustache = '', jsx = '';
  var tokens = tokenize(jsxtache);

  // console.log(tokens);
  var result = crossCompile(mustache, jsx, tokens);
  return {
    mustache: result.mustache,
    jsx: result.jsx
  }
}

/**
 *
 */
function handleMustachePartial(path) {
  return MUSTACHE_TAGS[0] + '> ' + PREFIX_MUSTACHE_PARTIAL + path + MUSTACHE_TAGS[1];
}

/**
 *
 */
function handleJSXPartial(path, scope, additionalProps) {
  var varName = path.split('/').map(function(part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
  requirePartials.push({ varName: varName, path: path});
  var childProps = '';
  ['this.props', 'this.state', scope].forEach(function(context) {
    if (!!context) {
      childProps += (' ' + JSX_TAGS[0] + JSX_SPREAD + context + JSX_TAGS[1]);
    }
  });
  return '<' + varName + childProps + ' />';
}

/**
 * @TODO figure out params / options that make the most sense
 * i think (tokens:array, type:string, options:object)
 */
function crossCompile(mustache, jsx, tokens, scope, removePropsState) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i], key = token[0], val = token[1], children = token[4];

    // console.log('key: ', key)
    // console.log('val: ', val)

    switch (key) {
    case 'text':
      if (!!mustache || mustache === '') {
        mustache += val;
      }
      if (!!jsx || jsx === '') {
        jsx += val;
      }
      break;
    case 'name':
      if (!!mustache || mustache === '') {
        if (!!isJSXtacheKey(val)) {
          var formatted = handleJSXtache(val, true);
          if (!!formatted && mustache.charAt(mustache.length -1) !== ' ') {
            mustache += ' ';
          }
          mustache += formatted;
        } else {
          mustache += handleMustacheName(val);
        }
      }
      if (!!jsx || jsx === '') {
        if (!!isJSXtacheKey(val)) {
          if (jsx.charAt(jsx.length - 1) !== ' ') {
            jsx += ' ';
          }
          jsx += handleJSXtache(val, false);
        } else {
          jsx += handleJSXName(val, scope, removePropsState);
        }
      }
      break;
    case '&':
      if (!!mustache || mustache === '') {
        mustache += handleMustacheUnsafe(val);
      }
      if (!!jsx || jsx === '') {
        jsx += handleJSXUnsafe(val);
      }
      break;
    case '#':
      if (!!mustache || mustache === '') {
        mustache += handleMustacheBlock(val, children);
      }
      if (!!jsx || jsx === '') {
        jsx += handleJSXBlock(val, children);
      }
      break;
    case '^':
      if (!!mustache || mustache === '') {
        mustache += handleMustacheBlock(val, children, true);
      }
      if (!!jsx || jsx === '') {
        jsx += handleJSXInverse(val, children);
      }
      break;
    case '!':
      // handle comments. well, ignore comments.
      break;
    case '>':
      var parts = val.split(' ');
      parts = lodash.reject(parts, function (el) {
        return !el;
      });
      var partial = parts.shift();
      var additionalProps = parts.join(' ');

      if (!!mustache || mustache === '') {
        mustache += handleMustachePartial(partial);
      }
      if (!!jsx || jsx === '') {
        jsx += handleJSXPartial(partial, scope, additionalProps);
      }
    }
  }

  return {
    mustache: mustache,
    jsx: jsx
  }
}

function injectRequires(jsx) {
  requirePartials = lodash.uniq(requirePartials, 'varName');
  var requires = '';
  requirePartials.forEach(function(partial) {
    requires += 'var ' + partial.varName + ' = require(\'' + partial.path + '\');\n';
  });
  // reset requirePartials buffer since global scope
  requirePartials = [];
  return (requires + jsx);
}

/**
 *
 */
function parse(jsx) {
  var ast = esprima.parse(jsx, { range: true });
  return traverse(ast);
}

/**
 * @TODO solidify / confirm logic on what overwrites what. implicit file dependency vs direct inline.
 *       if mustache (.mustache file or mustache method), jsx assumed inline in render (like normal jsx)
 *       if no mustache, jsxtache assumed. .mustache.jsx file or jsxtache inline in render
 *       inline always takes precedence
 * @TODO write tests
 */
function transform(jsx, jsxtache, mustache, prefixMustachePartial) {
  if (!jsx) {
    throw chalk.red('Cannot transform that which cannot be transformed.')
  }

  if (!!prefixMustachePartial) {
    PREFIX_MUSTACHE_PARTIAL = prefixMustachePartial;
  }

  var list = parse(jsx);
  var compiled = {
    mustache: '',
    jsx: '',
    js: ''
  }

  // overwrites file if included inline
  if (!!list.mustacheReturnBlock) {
    mustache = jsx.substring(list.mustacheReturnBlock[0], list.mustacheReturnBlock[1]);
    mustache = eval(mustache);
    jsx = jsx.substring(0, list.mustache[0]) + jsx.substring(list.mustache[1]).replace(/^\s*,/, '');
    list = parse(jsx);
  }

  if (!!list.renderReturn) {
    var jsxRender;
    if (!!list.renderReturnBlock) {
      jsxRender = jsx.substring(list.renderReturnBlock[0], list.renderReturnBlock[1]);
      jsx = jsx.substring(0, list.renderReturnBlock[0]) + '\'\~\~JSX\~\~\'' + jsx.substring(list.renderReturnBlock[1]);
      jsxRender = eval(jsxRender);
    }

    if (!!mustache && !!list.renderReturnBlock) {
      jsx = renderReplace(jsx, jsxRender);
    } else {
      // is mustache isnt present, we assume jsxtache
      if (!!jsxRender) {
        jsxtache = jsxRender;
      }

      var result = transformJSXtache(jsxtache);

      if (!list.renderReturnBlock) {
        jsx = jsx.substring(0, list.renderReturn[0]) + 'return (\n\'\~\~JSX\~\~\');' + jsx.substring(list.renderReturn[1]);
      }

      jsx = renderReplace(jsx, result.jsx);
      jsx = injectRequires(jsx);
      mustache = result.mustache;
    }
  } else {
    throw chalk.red('JSX must have render method with a return statement.')
  }

  compiled.mustache = mustache.replace(/\n/g, '');
  compiled.jsx = jsx;
  compiled.js = reactTools.transform(compiled.jsx);
  return compiled;
}

module.exports = transform;

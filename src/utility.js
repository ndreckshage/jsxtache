/**
 *
 */
function trim(str) {
  return str.replace(/^\s*|\s*$/g, '');
}

/**
 *
 */
function startsWithQuotes(str) {
  return !!~['\'', '"'].indexOf(str.charAt(0));
}

/**
 *
 */
function removeQuotes(str) {
  return str.replace(/^[\'\"]|[\'\"]$/g, '');
}

exports.trim = trim;
exports.startsWithQuotes = startsWithQuotes;
exports.removeQuotes = removeQuotes;

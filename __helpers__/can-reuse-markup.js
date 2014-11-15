var MOD = 65521;

// This is a clean-room implementation of adler32 designed for detecting
// if markup is not what we expect it to be. It does not need to be
// cryptographically strong, only reasonably good at detecting if markup
// generated on the server is different than that on the client.
function adler32(data) {
  var a = 1;
  var b = 0;
  for (var i = 0; i < data.length; i++) {
    a = (a + data.charCodeAt(i)) % MOD;
    b = (b + a) % MOD;
  }
  return a | (b << 16);
}

/**
 *
 */
function canReuseMarkup(newMarkup, existingMarkup) {
  var markupChecksum = adler32(newMarkup);
  var existingChecksum = existingMarkup.match(/data\-react\-checksum\=[\'|\"](\-*\w*\d*)[\'|\"]/)[1];
  existingChecksum = parseInt(existingChecksum, 10);
  return markupChecksum === existingChecksum;
}

module.exports = canReuseMarkup;

const crypto = require('crypto');

function sha256HMAC(secret, payload) {
  // create the HMAC with the key
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);

  // return in the same format provided by github
  return `sha256=${hmac.digest('hex')}`;
}

module.exports = { sha256HMAC };

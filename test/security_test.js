const assert = require('assert');

describe('Security', () => {
  it('github signature matches', done => {
    const security = require('../src/utils/security');
    const fs       = require('fs');
  
    // header x-hub-signature-256
    const expected = 'sha256=58584d3b1578efcf67d29be681012191e8a24c9c22a4384bec14500c0f061734';
    let payload = fs.readFileSync('./test/security_test_payload.json', { encoding: 'utf-8' });
    
    // these should be the same from security's HMAC using the dummy secret
    assert.equal(expected, security.sha256HMAC('AAA', payload));
    done();
  });
});

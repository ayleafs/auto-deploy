const supertest = require('supertest');
const { getConfig } = require('../src/global');

describe('Server', () => {
  describe('POST /push', () => {
    const { app } = require('../src/index');
    const security = require('../src/utils/security');

    const request = supertest(app);

    // generate a random SHA256 hash
    let randomHash = [ ...new Array(64) ].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    it('non json request', done => {
      request.post('/push')
        .set('x-hub-signature-256', randomHash)
        .expect(400, done);
    });

    it('invalid github signature', done => {
      request.post('/push')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', randomHash)
        .send({}).expect(403, done);
    });

    it('valid github signature', done => {
      let body = { foo: 'bar' };
      let stringed = JSON.stringify(body);

      // create a valid hash and json body
      let hmac = security.sha256HMAC(getConfig().content.github.secret, stringed);

      request.post('/push')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', hmac)
        .send(body)
        .expect(200, done);
      });
  });
});

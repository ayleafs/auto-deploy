const security = require('./utils/security');

const express = require('express');
const bodyParser = require('body-parser');
const { Process } = require('./processes');
const { getConfig } = require('./global');

const app = express();

// for json bodies
app.use(bodyParser.json());

app.post('/push', (req, res) => {
  if (req.header('Content-Type') !== 'application/json') {
    res.sendStatus(400);
    return; // we need a JSON body to work with
  }

  // header containing sha256 HMAC using GitHub secret
  // formatted sha256=HEX_HASH
  const sha256 = req.header('x-hub-signature-256');

  // get the json body as a string
  const payload = JSON.stringify(req.body);

  // get the signature and compare
  const signature = security.sha256HMAC(getConfig().content.github.secret, payload);
  if (sha256 !== signature) {
    res.sendStatus(403);
    return; // ignore everything else
  }

  res.sendStatus(200);
  Process.replaceActive();
});

app.listen(getConfig().content.port, () => {
  console.log(`Listening now on port ${getConfig().content.port}`);

  const { repo } = getConfig().content.github;
  Process.replaceActive(new Process(repo.start, repo.url)); // start the default task
});

module.exports = { app };

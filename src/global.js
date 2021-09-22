const { JsonFile } = require('./utils/files');

// default config
const config = new JsonFile('config', {
  github: {
    secret: 'shhhh',

    repo: {
      url: 'https://github.com/ayleafs/cyberbully-bot',

      // the repository we will focus on for cloning and pulling
      pull_from: 'production',
      start: 'npm start'
    }
  },

  port: 4200
});

function getConfig() {
  return config;
}

module.exports = { getConfig };

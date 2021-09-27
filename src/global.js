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

  // this option is to determine whether or not the application
  // can have a start overlap, express servers cannot (https://stackoverflow.com/questions/43003870/how-do-i-shut-down-my-express-server-gracefully-when-its-process-is-killed#43095094)
  start_overlap: false,
  port: 4200
});

function getConfig() {
  return config;
}

module.exports = { getConfig };

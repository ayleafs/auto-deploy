const childProcess  = require('child_process');
const { getConfig } = require('../global');


class GitHubRepo {
  constructor(url, branch) {
    this.url    = url;
    this.branch = branch;
  }

  pullInto(directory) {
    // clone into the proper directory
    childProcess.execSync(`git clone ${this.url} "${directory}"`);

    // put the directory on the right branch (creates the branch if it doesn't exist
    // to avoid having to deal with any errors)
    childProcess.execSync(`cd "${directory}" && git checkout -b ${this.branch}`)
  }
}

module.exports = { GitHubRepo };

const childProcess = require('child_process');
const { getConfig } = require('../global');
const { Files } = require('../utils/files');

const { v4 } = require('uuid');


class Process {
  static path = 'process'; // the folder all processes will be cloned into

  static async replaceActive(process) {
    // start this process and wait for the callback
    await process.start();
    this.currentProcess?.kill(); // kill the active process

    this.currentProcess = process;
  }

  constructor(command, url = '') {
    this.cmd = command;
    this.github = url;

    this.uuid = v4();
    this.dir  = Files.cwdPath(Process.path, this.uuid);
  }

  start() {
    // makes all the required directories
    Files.mkdirs(this.dir);

    // start the cloning process
    if (this.github?.length > 0) {
      // clone the URL into this.dir
      childProcess.execSync(`git clone ${this.github} "${this.dir}"`);
    }

    // spawn the child using the start command
    this.spawned = childProcess.exec(`cd "${this.dir}" && ${getConfig().content.github.repo.start}`, {
      cwd: this.dir,
      env: { ...process.env, AUTO_DEPLOY: true }
    });

    // wait till the process is spawned to read from stdout
    this.spawned.on('spawn', () => {
      console.log(`process started in ${this.uuid}`);

      // this.spawned.stdout.on('data', console.log);
    });

    this.spawned.on('error', console.error);

    this.spawned.once('exit', code => {
      if (code === 0) {
        return; // ignore exit codes of 0
      }

      // only call the die callback if it is available
      if (this.exitCallback) this.exitCallback();
    });
  }

  onDie(callback) {
    this.exitCallback = callback;
  }
}

module.exports = { Process };

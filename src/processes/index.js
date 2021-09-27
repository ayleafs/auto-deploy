const childProcess = require('child_process');
const { getConfig } = require('../global');
const { Files } = require('../utils/files');
const { GitHubRepo } = require('./github');

const { v4 } = require('uuid');


class Process {
  static path = 'process'; // the folder all processes will be cloned into

  static async replaceActive(process) {
    // start this process and wait for the callback
    await process.start();
    this.currentProcess?.kill(); // kill the active process

    this.currentProcess = process;
  }

  constructor(command, url = '', branch = 'master') {
    this.cmd = command;
    this.github = new GitHubRepo(url, branch);

    this.uuid = v4();
    this.dir  = Files.cwdPath(Process.path, this.uuid);

    this.exitCallback = () => {
      if (!getConfig().content.restart_on_crash) {
        return;
      }

      this.start();
    };
  }

  start() {
    return new Promise(resolve => {
      // makes all the required directories
      Files.mkdirs(this.dir);

      // start the cloning process
      if (this.github.url?.length > 0) {
        // clone the URL into this.dir
        this.github.pullInto(this.dir);
      }

      const overlap = getConfig().content.start_overlap;

      // only wait till git is pulled before starting
      if (!overlap) resolve();

      // spawn the child using the start command
      this.spawned = childProcess.exec(`cd "${this.dir}" && ${getConfig().content.github.repo.start}`, {
        cwd: this.dir,
        env: { ...process.env, AUTO_DEPLOY: true }
      });

      // wait till the process is spawned to read from stdout
      this.spawned.on('spawn', () => {
        console.log(`process started in ${this.uuid}`);

        // this.spawned.stdout.on('data', console.log);
        if (overlap) resolve();
      });

      this.spawned.on('error', console.error);

      this.spawned.once('exit', code => {
        this.rmdir();

        if (code === 69) {
          console.log('process killed');
          return;
        }

        console.log('process exited');

        if (code === 0) {
          return; // ignore exit codes of 0
        }

        // only call the die callback if it is available
        if (this.exitCallback) this.exitCallback();
      });
    });
  }

  kill() {
    console.log(this.spawned.kill('SIGKILL'));
  }

  onDie(callback) {
    this.exitCallback = callback;
  }

  rmdir() {
    Files.rmdir(this.dir);
  }
}

module.exports = { Process };

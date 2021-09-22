const path = require('path');
const fs   = require('fs');

class Files {
  static path = 'files';

  static mkdirs(dir) {
    if (fs.existsSync(dir)) {
      return;
    }

    // make all directories involved
    fs.mkdirSync(dir, { recursive: true });
  }

  static cwdFilePath(...dir) {
    return path.join(process.cwd(), Files.path, ...dir);
  }

  static cwdPath(...dir) {
    return path.join(process.cwd(), ...dir);
  }
}

class JsonFile {
  constructor(fileName, defaultContent) {
    // automatically append .json as the file extension unless present
    this.name = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

    this.fullPath = Files.cwdFilePath(this.name);
    this.content  = defaultContent;

    // if the file can't be read properly then save the contents
    if (!this.parseContents()) this.save();
  }
  
  parseContents() {
    if (!fs.existsSync(this.fullPath)) {
      return false; // the file does not exist (didn't parse)
    }

    const contents = fs.readFileSync(this.fullPath);
    let jsonData   = {};

    try {
      jsonData = JSON.parse(contents);
    } catch (err) {
      // failed to read the JSON contents as JSON
      console.error(err);
      return false;
    }

    // merge the content with the json read (to allow for unset properties)
    this.content = Object.assign(this.content, jsonData);
    // save for any unset defaults
    this.save();

    return true;
  }

  save() {
    let filesPath = Files.cwdFilePath();
    Files.mkdirs(filesPath);

    // create a json string with 2 spaced tabs
    let stringJson = JSON.stringify(this.content, null, 2);
    
    // write the string json with utf-8 encoding to ensure compatibility
    fs.writeFileSync(this.fullPath, stringJson, { encoding: 'utf-8' });
  }
}

module.exports = { Files, JsonFile };

const fs = require('fs');
const crypto = require('crypto');
const esprima = require('esprima');
const commandExists = require('command-exists').sync;
const exec = require('child_process').execSync;

module.exports = {

  /** Recursively reads all javascript files in a given path and calls a given callback on that */
  forEachJSFileRecursive: function forEachJSFileRecursive(path, callback) {
    if (!path.endsWith('/')) { path += '/' }

    const files = fs.readdirSync(path);
    files.forEach(file => {
      const stats = fs.statSync(path + file);
      if (stats.isDirectory()) {
        forEachJSFileRecursive(path + file, callback);
      } else if (file.endsWith('.js')) {
        const contents = fs.readFileSync(path + file, 'utf-8');
        callback(path + file, contents);
      }
    });
  },

  listJSFilesRecursive: function listFilesRecursive(path) {
    let results = [];

    const stats = fs.statSync(path);

    if (stats.isDirectory()) {
      if (!path.endsWith('/')) { path += '/' }
      const files = fs.readdirSync(path);
      files.forEach(file => {
        results = results.concat(listFilesRecursive(path + file));
      });
    } else if (path.endsWith('.js')) {
      results.push(path);
    }

    return results;
  },

  listSourceFiles: function listSourceFiles(repo, language) {
    if (!commandExists('linguist')) { throw new Error('https://github.com/github/linguist/ is not installed'); }
    const stdout = exec(`linguist ${repo} --json`);
    const stats = JSON.parse(stdout);
    return (stats[language] || []).map(file => `${repo}${file}`);
  },

  isMaximumInArray: function(element, ary) {
    if (ary.indexOf(element) == -1) {
      throw new Error(`${ary} does not contain ${element}`);
    }

    return Math.max(...ary) === element;
  },

  // Retrieves the AST of the given file
  // A cached AST will be returned if available
  // If not, the contents will be parsed and the resulting AST will be cached
  getAst: function getAst(file) {
    const contents = fs.readFileSync(file, { encoding: 'utf-8' });
    const checksum = crypto
          .createHash('md5')
          .update(contents, 'utf8')
          .digest('hex');
    const cacheFile = `./.cache/${checksum}`;
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile))
    }

    let ast;
    try {
      ast = esprima.parse(contents, { loc: true, tolerant: true });
    } catch(err) {
      return null;
    }
    exec(`mkdir -p .cache/`, { cwd: process.cwd(), encoding: 'utf-8' });
    fs.writeFileSync(cacheFile, JSON.stringify(ast));
    return ast;
  },


  chunkArray: function(array, chunkSize) {
    if (chunkSize == 0) { throw new Error('chunkSize may not be 0'); }

    const chunks = [];
    while (array.length > 0){
      chunks.push(array.splice(0, chunkSize));
    }

    return chunks;
  }

}

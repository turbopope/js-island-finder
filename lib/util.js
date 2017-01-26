const fs = require('fs');

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

  isMaximumInArray: function(element, ary) {
    if (ary.indexOf(element) == -1) {
      throw new Error(`${ary} does not contain ${element}`);
    }

    return Math.max(...ary) === element;
  }

}

const fs = require('fs');

module.exports = {

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
  }

}

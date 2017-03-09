const fs = require('fs');

function filter(files, whitelist) {
  let result = [];

  if (whitelist) {
    for (let file of files) {
      // Must be whitelisted
      if (whitelist.some((whitelist_entry, index, array) => {
        return file.startsWith(whitelist_entry);
      })) {
        result.push(file);
      } else {
      }
    }
  } else {
    result = files;
  }

  let resultIterate = result.slice();
  result = [];

  for (let file of resultIterate) {
    // Must be a file
    const stats = fs.lstatSync(file);
    if (!stats.isFile()) {
      continue;
    }

    // Must not be a *.min.js
    if (file.endsWith('.min.js')) {
      continue;
    }

    // Must contain 'require'
    const content = fs.readFileSync(file, { encoding: 'utf-8' });
    const head = content.substring(0, 1000);
    if (!head.includes('require')) {
      continue;
    }

    result.push(file)
  }

  return result;
}

module.exports = filter;

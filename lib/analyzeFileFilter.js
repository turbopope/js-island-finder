const fs = require('fs');

function filter(files, whitelist) {
  let accepted = [];
  let rejected = []

  if (whitelist) {
    for (let file of files) {
      // Must be whitelisted
      if (whitelist.some((whitelist_entry, index, array) => {
        return file.startsWith(whitelist_entry);
      })) {
        accepted.push(file);
      } else {
        rejected.push([file, 'Not whitelisted']);
      }
    }
  } else {
    accepted = files;
  }

  let acceptedIterate = accepted.slice();
  accepted = [];

  for (let file of acceptedIterate) {
    // Must be a file
    const stats = fs.lstatSync(file);
    if (!stats.isFile()) {
      rejected.push([file, 'Not a file']);
      continue;
    }

    // Must not be a *.min.js
    if (file.endsWith('.min.js')) {
      rejected.push([file, 'Is a minified file']);
      continue;
    }

    // Must contain 'require'
    const content = fs.readFileSync(file, { encoding: 'utf-8' });
    const head = content.substring(0, 1000);
    if (!head.includes('require')) {
      rejected.push([file, 'Does not require anything']);
      continue;
    }

    accepted.push(file)
  }
  // console.dir(rejected);
  return accepted;
}

module.exports = filter;

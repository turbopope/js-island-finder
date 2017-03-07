const fs = require('fs');

function filter(files, whitelist) {
  let result = [];

  if (whitelist) {
    console.log("Using whitelist")
    for (let file of files) {
      // Must be whitelisted
      if (whitelist.some((whitelist_entry, index, array) => {
        return file.startsWith(whitelist_entry);
      })) {
        result.push(file);
      } else {
        console.log(`Rejecting ${file} because it's not whitelisted`)
      }
    }
  } else {
    result = files;
  }

  let resultIterate = result.slice();
  result = [];

  for (let file of resultIterate) {
    // console.log(`${i} < ${resultIterate.length}`)
    // console.error(file)

    // Must not be a *.min.js
    if (file.endsWith('.min.js')) {
      console.log(`Rejecting ${file} because it ends with '.min.js'`);
      continue;
    }

    // Must contain 'require'
    const content = fs.readFileSync(file, { encoding: 'utf-8' });
    const head = content.substring(0, 1000);
    if (!head.includes('require')) {
      console.log(`Rejecting ${file} because it's does not contain 'require' in the first 1000 characters`);
      continue;
    }

    console.log(`Keeping ${file}`);
    result.push(file)
  }

  console.error(`Returning ${result}`)

  return result;
}

module.exports = filter;

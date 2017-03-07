const fs = require('fs');

function filter(files, whitelist) {
  let result = [];

  if (whitelist) {
    console.log("Using whitelist")
    for (let file of files) {
      if (whitelist.some((whitelist_entry, index, array) => {
        return file.startsWith(whitelist_entry);
      })) {
        result.push(file);
      } else {
        console.log(`Rejecting ${file} because it's not whitelisted`)
      }
    }
  } else {
    result = result.concat(files);
  }

  for (let i = 0; i < result.length; i++) {
    const content = fs.readFileSync(files[i], { encoding: 'utf-8' });
    const head = content.substring(0, 1000);
    if (!head.includes('require')) {
      console.log(`Rejecting ${files[i]} because it's does not contain 'require' in the first 1000 characters`);
      result.splice(i, 1);
    }
  }

  return result;
}

module.exports = filter;

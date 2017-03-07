function filter(files, whitelist) {
  let result = [];

  if (whitelist) {
    console.error("Using whitelist")
    for (let file of files) {
      if (whitelist.some((whitelist_entry, index, array) => {
        console.log(`Starts ${file} with ${whitelist_entry}?`);
        return file.startsWith(whitelist_entry);
      })) {
        result.push(file);
      }
    }
  } else {
    result = result.concat(files);
  }

  return result;
}

module.exports = filter;

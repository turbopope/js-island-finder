const fs = require('fs');

function copyFileSync(source, target) {
  fs.writeFileSync(target, fs.readFileSync(source));
}

module.exports = copyFileSync;

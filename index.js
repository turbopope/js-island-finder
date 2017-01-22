const fs = require('fs');
const esprima = require('esprima');
const APIUseWalker = require('./APIUseWalker');
const colors = require('colors');



function forEachJSFileRecursive(path, callback) {
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

function mergeUses(a, b) {
  const bCallees = Object.getOwnPropertyNames(b);
  bCallees.forEach(callee => {
    if (a.hasOwnProperty(callee)) {
      const aAuthors = Object.getOwnPropertyNames(a[callee]);
      const bAuthors = Object.getOwnPropertyNames(b[callee]);
      bAuthors.forEach(author => {
        if (aAuthors.indexOf(author) > -1) {
          a[callee][author] += b[callee][author];
        } else {
          a[callee][author] = b[callee][author];
        }
      });
    } else {
      a[callee] = b[callee];
    }
  });
  return a;
}



const repo = process.argv[2];
const globalUses = {};

forEachJSFileRecursive(repo, function(filename, contents) {
  console.log(filename.green);
  const walker = new APIUseWalker(repo, filename);
  try {
    const ast = esprima.parse(contents, { loc: true, tolerant: true });
  } catch(err) {
    console.error('Could not parse!');
    return;
  }

  walker.handleNode(ast);
  walker.finalize();
  const uses = walker._uses;
  const requires = walker._requires;
  var requiredAndUsed = {};
  Object.getOwnPropertyNames(walker._requires).forEach(required => {
    if (uses.hasOwnProperty(required)) {
      requiredAndUsed[required] = uses[required];
    }
  });
  mergeUses(globalUses, requiredAndUsed);
});

console.dir(globalUses, { colors: true });

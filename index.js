const fs = require('fs');
const esprima = require('esprima');
const APIUseWalker = require('./APIUseWalker');
const colors = require('colors');


function log_functions(obj) {
  console.log(
    Object.getOwnPropertyNames(obj).filter(function(p){
      return typeof(obj[p]) === 'function';
    })
  );
}

function log_properties(obj) {
  props = Object.getOwnPropertyNames(obj);
  props.forEach(function(prop){
    console.log(prop + " - " + typeof(obj[prop]));
  });
}

// console.log("request:")
// log_properties(require('request'));
// console.log("\ncrypto:")
// log_properties(require('crypto'));



// const source = fs.readFileSync('./func.js', 'utf-8');

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
const uses = {};

forEachJSFileRecursive(repo, function(filename, contents) {
  console.log(filename.green);
  // const contents = fs.readFileSync('./testsrc/func.js', 'utf-8');
  const walker = new APIUseWalker(repo, filename);
  try {
    const ast = esprima.parse(contents, { loc: true, tolerant: true });
  } catch(err) {
    console.error('Could not parse!');
    return;
  }
  // console.dir(ast, { depth: null, colors: true });

  walker.handleNode(ast);
  mergeUses(uses, walker._uses);
  // console.dir(walker._uses, { colors: true });
});

console.dir(uses, { colors: true });

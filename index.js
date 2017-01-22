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
  fs.readdir(path, function(err, files){
    if (err) throw err;

    files.forEach(function(file) {
      fs.stat(path + file, function(err, stats){
        if (err) throw err;
        if (stats.isDirectory()) {
          forEachJSFileRecursive(path + file, callback);
        } else if (file.endsWith('.js')) {
          fs.readFile(path + file, 'utf-8', function(err, contents) {
            callback(path + file, contents);
          });
        }
      });
    });
  });
}


const repo = process.argv[2];

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
});

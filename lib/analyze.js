#!/usr/bin/node

"use strict";

const fs = require('fs');
const esprima = require('esprima');
const APIUseWalker = require('./APIUseWalker');
const colors = require('colors');
const forEachJSFileRecursive = require('./util').forEachJSFileRecursive;
const listJSFilesRecursive = require('./util').listJSFilesRecursive;
const getAst = require('./util').getAst;
const uses = require('./uses');
const filterFiles = require('./analyzeFileFilter');
const Table = require('./Table');
const async = require('async');
const execSync = require('child_process').execSync;
const sanitizeFilename = require("sanitize-filename");



function analyze(repo, whitelist, outDir = "out/", treeish = "master", outBase) {

  function extract(file, callback) {
    console.log(file.green);
    let ast = getAst(file);
    const walker = new APIUseWalker(repo, file);
    walker.handleNode(ast);
    walker.finalize();
    callback(null, walker._uses);
  }

  let filesToAnalyze = [];
  execSync(`git checkout -q ${treeish}`, { cwd: repo, encoding: 'utf-8' });
  filesToAnalyze = filterFiles(listJSFilesRecursive(repo), whitelist);

  const globalUses = new Map();

  async.map(filesToAnalyze, extract, (err, results) => {
    if (err)
      console.error(err);
    for (let result of results) {
      uses.mergeUses(globalUses, result);
    }
  });

  let usesTable = new Table(0);
  globalUses.forEach((useage, mName) => {
    console.log(mName);
    uses.sortUses(useage).forEach((amount, author) => {
      console.log('  ' + author.green + ': ' + amount);
      usesTable.setOrAdd(author, mName, amount);
    })
  });

  const repoSplits = repo.split('/').reverse();
  const repoName = repoSplits[0] || repoSplits[1];
  const timecode = new Date().toISOString();
  const outFileName = sanitizeFilename(outBase || `${repoName}_${treeish}`);
  fs.writeFileSync(`${outDir}${outFileName}.json`, uses.serializeMap(globalUses));
  fs.writeFileSync(`${outDir}${outFileName}.csv`, usesTable.toCSV());
  execSync(`git checkout -q master`, { cwd: repo, encoding: 'utf-8' });
}

module.exports = analyze;

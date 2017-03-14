#!/usr/bin/node

"use strict";

const fs = require('fs');
const esprima = require('esprima');
const APIUseWalker = require('./APIUseWalker');
const colors = require('colors');
const listSourceFiles = require('./util').listSourceFiles;
const listJSFilesRecursive = require('./util').listJSFilesRecursive;
const getAst = require('./util').getAst;
const uses = require('./uses');
const filterFiles = require('./analyzeFileFilter');
const generateMailmap = require('./mailmap');
const Table = require('./Table');
const execSync = require('child_process').execSync;
const sanitizeFilename = require("sanitize-filename");
const ProgressBar = require('progress');



function analyze(repo, whitelist, outDir = "out/", treeish = "master", outBase) {
  execSync(`git checkout -q ${treeish}`, { cwd: repo, encoding: 'utf-8' });
  execSync(`mkdir -p ${outDir}`, { cwd: process.cwd(), encoding: 'utf-8' });

  const mailmapFile = `${repo}.mailmap`;
  let generatedMailmap = false;
  if (!fs.existsSync(mailmapFile)) {
    console.log('Generating mailmap')
    const mailmap = generateMailmap(repo);
    fs.writeFileSync(mailmapFile, mailmap);
    fs.writeFileSync(`${outDir}mailmap`, mailmap);
    generatedMailmap = true;
  }

  let filesToAnalyze = [];
  const jsSourceFiles = listSourceFiles(repo, 'JavaScript');
  filesToAnalyze = filterFiles(jsSourceFiles, whitelist);

  const globalUses = new Map();
  let errors = 0;

  var bar = new ProgressBar('analyzing [:bar] :current/:total, :percent | elapsed: :elapseds | eta: :etas | :file', {
    width: 32,
    total: filesToAnalyze.length
  });

  for (let file of filesToAnalyze) {
    bar.tick({file});
    let ast = getAst(file);
    if (ast === null) {
      errors++;
      continue;
    }
    const walker = new APIUseWalker(repo, file);
    walker.handleNode(ast);
    walker.finalize();
    uses.mergeUses(globalUses, walker._uses);
  }

  let usesTable = new Table(0);
  globalUses.forEach((useage, mName) => {
    uses.sortUses(useage).forEach((amount, author) => {
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
  if (generatedMailmap) { fs.unlinkSync(mailmapFile); }

  function sum(ary) {
    return ary.reduce((a, b) => a + b, 0);
  }
  const totalUses = sum(Array.from(usesTable._rows.keys()).map(row => sum(usesTable.getRow(row))))
  console.log(`Analyzed ${filesToAnalyze.length - errors} of ${filesToAnalyze.length} files. Found ${usesTable._rows.size} authors using ${usesTable._cols.size} modules in ${totalUses} instances.`);
}

module.exports = analyze;

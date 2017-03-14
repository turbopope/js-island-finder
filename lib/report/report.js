#!/usr/bin/node

const pug = require('pug');
const fs = require('fs');
const Table = require('../Table');
const copyFile = require('../copyFile');
const execSync = require('child_process').execSync;
const path = require('path');

function report(dataDir, outDir) {
  const domainsFile           = `${process.cwd()}/${dataDir}condensed.csv`;
  const modulesFile           = `${process.cwd()}/${dataDir}uses.csv`;
  const remapFile             = `${process.cwd()}/${dataDir}resolved_remap.json`;
  const modulesToKeywordsFile = `${process.cwd()}/${dataDir}resolved_modulesToKeywords.json`;
  const mailmapFile           = `${process.cwd()}/${dataDir}mailmap`;

  const repoName = dataDir.split(path.sep).slice(-2, -1);

  const domains           = Table.parse(fs.readFileSync(domainsFile,           { encoding: "utf-8" }));
  const modules           = Table.parse(fs.readFileSync(modulesFile,           { encoding: "utf-8" }));
  const remap             = JSON.parse (fs.readFileSync(remapFile,             { encoding: "utf-8" }));
  const modulesToKeywords = JSON.parse (fs.readFileSync(modulesToKeywordsFile, { encoding: "utf-8" }));
  let   mailmap           = undefined;
  if (fs.existsSync(mailmapFile)) {
    mailmap               =             fs.readFileSync(mailmapFile,           { encoding: "utf-8" });
  }

  const MODULE_THRESHOLD = 25;
  const AUTHOR_THRESHOLD = 25;

  function sum(ary) {
    return ary.reduce((a, b) => a + b, 0);
  }

  for (let row of domains._rows) {
    if (sum(domains.getRow(row)) < AUTHOR_THRESHOLD) {
      domains.removeRow(row);
    }
  }
  for (let col of domains._cols) {
    if (sum(domains.getCol(col)) < MODULE_THRESHOLD) {
      domains.removeCol(col);
    }
  }

  const heatmap = new Table();
  for (let col of domains._cols) {
    let colSum = sum(domains.getCol(col));
    for (let row of domains._rows) {
      let fraction = domains.get(row, col) / colSum;
      let heat = Math.floor(fraction * 9);
      let percentage = (fraction * 100).toFixed(2) + '%';
      heatmap.set(row, col, {heat, percentage});
    }
  }

  mailmap = mailmap.trim().split("\n").map(line => { return line.split("\t"); });

  const reportData = {
    title: repoName,
    short_title: repoName,
    domains,
    remap,
    modules,
    heatmap,
    modulesToKeywords,
    mailmap,
    sum: sum
  }

  execSync(`mkdir -p ${outDir}`, { cwd: process.cwd(), encoding: 'utf-8' });
  fs.writeFileSync(`${outDir}report.html`, pug.renderFile(__dirname + '/report.pug', reportData));
  copyFile(__dirname + '/reveal.js',  `${outDir}reveal.js`);
  copyFile(__dirname + '/report.css', `${outDir}report.css`);
}

module.exports = report;

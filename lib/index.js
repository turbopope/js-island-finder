const analyze = require('../lib/analyze');
const modulesToKeywords = require('../lib/modulesToKeywords');
const condense = require('../lib/condense');
const report = require('../lib/report/report.js');
const execSync = require('child_process').execSync;
const fs = require('fs');

function index (repo, outDir, revision = 'master', whitelist = undefined) {
  execSync(`mkdir -p ${outDir}`, { cwd: process.cwd(), encoding: 'utf-8' });
  analyze(repo, whitelist, outDir, revision, "uses");
  modulesToKeywords(`${outDir}uses.csv`, `${outDir}resolved`);

  function do_condense() {
    condense(`${outDir}resolved.csv`, `${outDir}condensed.csv`);
    report(outDir, outDir);
  }
}


module.exports = index;

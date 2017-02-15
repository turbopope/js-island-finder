#!/usr/bin/node

const execSync = require('child_process').execSync;
const leftPad = require('left-pad');
const path = require('path');
const analyze = require('./analyze');



function analyze_histroy(repo, outDir, stepWidth, whitelist) {
  execSync(`git checkout -q master`, { cwd: repo, encoding: 'utf-8' });
  let allRevs = execSync(`git log --oneline --no-abbrev-commit`, { cwd: repo, encoding: 'utf-8' });
  allRevs = allRevs.split("\n");
  allRevs = allRevs.slice(0, -1);
  allRevs = allRevs.map(rev => {
    const splitted = rev.split(' ');
    return splitted[0];
  });

  const targetRevs = new Map();
  for (let i = 0; i < allRevs.length; i += stepWidth) {
    targetRevs.set(i, allRevs[i]);
  }
  const latestI = allRevs.length - 1;
  targetRevs.set(latestI, allRevs[latestI]);

  console.log(`Processing ${targetRevs.size} of ${allRevs.length} revisions`)
  targetRevs.forEach((sha, i) => {
    console.log(`${new Date().toISOString()}: Processing HEAD~${i} (${sha})`);
    execSync(`mkdir -p ${outDir}`, { cwd: process.cwd(), encoding: 'utf-8' });
    analyze(repo, whitelist, outDir, sha);
    // execSync(`../analyze ${repo} ${outDir} ${sha} ${whitelist.join(' ')}`, { cwd: '.', encoding: 'utf-8' });
    execSync(`mv ${outDir}/${path.basename(repo)}_${sha}.json ${outDir}/${leftPad(i, 4, '0')}.json `, { cwd: process.cwd(), encoding: 'utf-8' });
    execSync(`mv ${outDir}/${path.basename(repo)}_${sha}.csv ${outDir}/${leftPad(i, 4, '0')}.csv `, { cwd: process.cwd(), encoding: 'utf-8' });
  });
}

module.exports = analyze_histroy;

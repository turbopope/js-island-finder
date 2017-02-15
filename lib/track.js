#!/usr/bin/node

// Creates a CSV of the history of API useage of one author or one module.

const fs = require('fs');
const Table = require('./Table');
const path = require('path');



exports.author = (author, files) => {
  const result = new Table(0);

  if (!Array.isArray(files)) {
    files = fs.readdirSync(files).map(filename => { return `${files}${filename}` });
  }

  for (let file of files) {
    if (!file.toLowerCase().endsWith('.json')) continue;
    const contents = fs.readFileSync(file, { encoding: 'utf-8' });
    const uses = JSON.parse(contents);

    for (let mod in uses) {
      const modStats = uses[mod];
      const usesByAuthor = modStats[author] || 0;
      result.set(path.basename(file, '.json'), mod, usesByAuthor);
    }
  }

  return result;
}


exports.module = (mod, files) => {
  const result = new Table(0);
  console.dir(files)

  if (!Array.isArray(files)) {
    files = fs.readdirSync(files).map(filename => { return `${files}${filename}` });
  }

  for (let file of files) {
    if (!file.toLowerCase().endsWith('.json')) continue;
    const contents = fs.readFileSync(file, { encoding: 'utf-8' });
    const uses = JSON.parse(contents);

    const row = path.basename(file, '.json')
    result.ensureHasRow(row);

    const modStats = uses[mod];
    for (let author in modStats) {
      const usesByAuthor = modStats[author] || 0;
      result.set(row, author, usesByAuthor);
    }
  }

  return result;
}

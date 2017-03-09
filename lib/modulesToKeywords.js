const parse = require('csv-parse');
const transform = require('stream-transform');
const stringify = require('csv-stringify');
const request = require('sync-request');
const fs = require('fs');
const _ = require('lodash');
const globals = require('./globals');
const builtin = require('./builtin-modules');
const uses = require('./uses');

function modulesToKeywords(file, outBase, callback, keywordStatsFile = process.cwd() + '/out/keywords_counted.json') {
  const raw = fs.readFileSync(file, { encoding: "utf-8" });
  const keywordStats = JSON.parse(fs.readFileSync(keywordStatsFile));
  let readFirstRow = false;
  let firstRowCopy = null;

  const rrows = raw.split("\n");
  const [ffirst, ...rrest] = rrows;
  firstRowCopy = `${ffirst}`;

  const remap = new Map();
  const modulesToKeywords = new Map();

  parse(raw, {}, onParsed);

  function onParsed(err, parsed) {
    if (err) throw err;
    transform(parsed, transformRow, onTransformed);
  }

  function transformRow(row) {
    if (readFirstRow) {
      // Do nothing
    } else {

      for (let i = 1; i < row.length; i++) {
        const moduleName = row[i];
        let keyword = undefined;

        if (Object.keys(globals).includes(moduleName)) {
          // console.log(`${moduleName} is a global object`)
          // keyword = '$' + globals[moduleName];
          keyword = globals[moduleName];
        } else if (Object.keys(builtin).includes(moduleName.toLocaleLowerCase())) {
          // console.log(`${moduleName} is a builtin object`)
          // keyword = '@' + builtin[moduleName];
          keyword = builtin[moduleName];
        } else {
          // console.log(`${moduleName} is an external module`)
          const baseModuleName = moduleName.split("/")[0];
          const url = `http://localhost:5984/npm-skim/${baseModuleName}`;
          let mod = null;
          try {
            mod = JSON.parse(request('GET', url).getBody());
          } catch (err) {
            continue;
          }
          const keywords = mod['keywords'] || [];
          const keywordsWithCounts = _.pick(keywordStats, keywords);
          modulesToKeywords.set(baseModuleName, keywordsWithCounts);
          let max = Number.NEGATIVE_INFINITY;
          // console.log(keywordsWithCounts);
          for (let prop in keywordsWithCounts) {
            const val = keywordsWithCounts[prop];
            if (val > max) {
              // console.log(`testing ${prop} => ${val}`)
              max = val;
              keyword = prop;
            }
          }
        }
        // console.log(`max is ${keyword}`)

        if (keyword) {
          if (!remap.has(keyword.toUpperCase())) remap.set(keyword.toUpperCase(), []);
          const entry = remap.get(keyword.toUpperCase());
          entry.push(moduleName);
          remap.set(keyword.toUpperCase(), entry);
        }

        row[i] = keyword ? keyword.toUpperCase() : moduleName;
      }
      readFirstRow = true;
    }
    return row;
  }

  function onTransformed(err, transformed) {
    if (err) throw err;
    stringify(transformed, (err, stringified) => {
      if (err) throw err;

      const rows = stringified.split("\n");
      const [first, ...rest] = rows;

      let report = "";
      report = report.concat(first + "\n");
      report = report.concat(firstRowCopy + "\n");
      report = report.concat(rest.join("\n"));
      // report = report.concat(";\n")
      fs.writeFileSync(outBase + '.csv', report);
      fs.writeFileSync(outBase + '_remap.json', uses.serializeMap(remap));
      fs.writeFileSync(outBase + '_modulesToKeywords.json', uses.serializeMap(modulesToKeywords));
      callback();
      // console.log(report);
    });
  }
}

module.exports = modulesToKeywords;

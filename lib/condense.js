const fs = require('fs');
const Table = require('table42');



function condense(inFile, outFile) {
  let csv = fs.readFileSync(inFile, { encoding: "utf-8" });

  // Remove second line with module names
  csv = csv.split("\n");
  csv.splice(1, 1);
  csv = csv.join("\n");

  const table = Table.parse(csv, false);
  table.sortRowsDescending(row => { return row.reduce((acc, val) => acc + val, 0); });
  if (outFile) {
    fs.writeFileSync(outFile, table.toCSV());
  } else {
    console.log(table.toCSV());
  }
}

module.exports = condense;

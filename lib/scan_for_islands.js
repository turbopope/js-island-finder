#!/usr/bin/node

const fs = require('fs');
const Table = require('table42');


// Format Fraction
function ff(fraction) {
  return (fraction * 100).toFixed(2) + '%';
}

function sum(ary) {
  return ary.reduce((a, b) => a + b, 0);
}

function scan(tableFile, options) {


  const table = Table.parse(fs.readFileSync(tableFile, { encoding: 'utf-8'} ));

  const MODULE_THRESHOLD = options.MODULE_THRESHOLD || 25;
  const AUTHOR_THRESHOLD = options.AUTHOR_THRESHOLD || 25;
  const PORTION_THRESHOLD = options.PORTION_THRESHOLD || 0.75;
  const CARRY_THRESHOLD = options.CARRY_THRESHOLD || 0.75;

  const result = {
    islandsByPortion: [],
    islandsByCarry: []
  }

  for (let row of table._rows) {
    if (sum(table.getRow(row)) < AUTHOR_THRESHOLD) {
      table.removeRow(row);
    }
  }
  for (let col of table._cols) {
    if (sum(table.getCol(col)) < MODULE_THRESHOLD) {
      table.removeCol(col);
    }
  }

  for (let location of table._cols) {
    let totalInLocation = sum(table.getCol(location));

    for (let author of table._rows) {
      let usesByAuthorInLocation = table.get(author, location);
      let portion = usesByAuthorInLocation / totalInLocation;
      // let percentage = (fraction * 100).toFixed(2) + '%';
      // If a developer has more than threshold percent of all uses in the domain
      if (portion >= PORTION_THRESHOLD) {
        result.islandsByPortion.push({
          location,
          author,
          total: totalInLocation,
          uses: usesByAuthorInLocation,
          portion,
        });
        // console.log(`${author} has actual=${ff(portion)} >= threshold=${ff(PORTION_THRESHOLD)} of all uses in ${domain}`);
      }
    }
  }

  for (let location of table._cols) {
    const usesInLocation = Array.from(table.getCol(location)); // Copy
    const authors = Array.from(table._rows.values()); // Copy
    const carryAuthorUses = Math.max(...usesInLocation);
    const carryAuthorIndex = usesInLocation.indexOf(carryAuthorUses);
    const carryAuthor = authors[carryAuthorIndex];
    // console.log(carryAuthor)
    usesInLocation.splice(carryAuthorIndex, 1); // Remove
    authors.splice(carryAuthorIndex, 1); // Remove
    const secondAuthorUses = Math.max(...usesInLocation);
    const secondAuthorIndex = usesInLocation.indexOf(secondAuthorUses);
    const secondAuthor = authors[secondAuthorIndex];
    const carryToSecond = 1 - secondAuthorUses / carryAuthorUses;
    // If the 2nd-most active developer has threshold percent less uses than the most active developer (the 'carry')
    if (carryToSecond >= CARRY_THRESHOLD) {
      result.islandsByCarry.push({
        location,
        carryAuthor,
        carryAuthorUses,
        secondAuthor,
        secondAuthorUses,
        carryToSecond,
      });
      // console.log(`#1 ${carryAuthor} has actual=${ff(carryToSecond)} >= threshold=${ff(CARRY_THRESHOLD)} more uses than #2 ${secondAuthor} in ${domain}`);
    }
  }

  return result;
}

module.exports = scan;

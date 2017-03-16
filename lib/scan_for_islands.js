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


  const domains = Table.parse(fs.readFileSync(tableFile, { encoding: 'utf-8'} ));

  const MODULE_THRESHOLD = options.MODULE_THRESHOLD || 25;
  const AUTHOR_THRESHOLD = options.AUTHOR_THRESHOLD || 25;
  const PORTION_THRESHOLD = options.PORTION_THRESHOLD || 0.75;
  const CARRY_THRESHOLD = options.CARRY_THRESHOLD || 0.75;

  const result = {
    islandsByPortion: [],
    islandsByCarry: []
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

  for (let domain of domains._cols) {
    let totalInDomain = sum(domains.getCol(domain));

    for (let author of domains._rows) {
      let usesByAuthorInDomain = domains.get(author, domain);
      let portion = usesByAuthorInDomain / totalInDomain;
      // let percentage = (fraction * 100).toFixed(2) + '%';
      // If a developer has more than threshold percent of all uses in the domain
      if (portion >= PORTION_THRESHOLD) {
        result.islandsByPortion.push({
          domain,
          author,
          total: totalInDomain,
          uses: usesByAuthorInDomain,
          portion,
        });
        // console.log(`${author} has actual=${ff(portion)} >= threshold=${ff(PORTION_THRESHOLD)} of all uses in ${domain}`);
      }
    }
  }

  for (let domain of domains._cols) {
    const usesInDomain = Array.from(domains.getCol(domain)); // Copy
    const authors = Array.from(domains._rows.values()); // Copy
    const carryAuthorUses = Math.max(...usesInDomain);
    const carryAuthorIndex = usesInDomain.indexOf(carryAuthorUses);
    const carryAuthor = authors[carryAuthorIndex];
    // console.log(carryAuthor)
    usesInDomain.splice(carryAuthorIndex, 1); // Remove
    authors.splice(carryAuthorIndex, 1); // Remove
    const secondAuthorUses = Math.max(...usesInDomain);
    const secondAuthorIndex = usesInDomain.indexOf(secondAuthorUses);
    const secondAuthor = authors[secondAuthorIndex];
    const carryToSecond = 1 - secondAuthorUses / carryAuthorUses;
    // If the 2nd-most active developer has threshold percent less uses than the most active developer (the 'carry')
    if (carryToSecond >= CARRY_THRESHOLD) {
      result.islandsByCarry.push({
        domain,
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

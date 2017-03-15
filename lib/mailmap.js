const idman = require('node-idman');
const Table = require('table42');
const _ = require('lodash');

module.exports = function(pathToRepo) {
  const repoStats = idman(pathToRepo);
  const identities = repoStats.identities;
  const commits = repoStats.commits;

  const pairCounts = new Map();

  for (let sha1 in commits) {
    const commit = commits[sha1];
    const {author_name, author_mail} = commit;
    const key = Table.key(author_name, author_mail); // This feels like abuse
    if (!pairCounts.has(key)) { pairCounts.set(key, 0); }
    pairCounts.set(key, pairCounts.get(key) + 1);
  }

  let result = [];

  for (let artifactPairs of identities) {
    artifactPairs = _.sortBy(artifactPairs, [pair => {
      const [author_name, author_mail] = pair;
      const key = Table.key(author_name, author_mail);
      return pairCounts.get(key);
    }]).reverse();

    const [firstPair, ...remainingPairs] = artifactPairs;
    if (remainingPairs.length == 0) {
      result.push(`${firstPair[0]} <${firstPair[1]}>`);
    } else {
      result = result.concat(remainingPairs.map(
        pair => { return `${firstPair[0]} <${firstPair[1]}>\t${pair[0]} <${pair[1]}>` }
      ));
    }
  }

  return result.join("\n");
}

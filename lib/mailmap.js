const idman = require('node-idman');

module.exports = function(pathToRepo) {
  const repoStats = idman(pathToRepo);
  const identities = repoStats.identities;
  let result = [];

  for (let artifactPairs of identities) {
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

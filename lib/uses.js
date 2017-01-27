/**
 * A uses object is a map from module names to the number of uses of the model by each author, e.g.:
 * { 'require': { 'jade': 3, 'john': 2 }, 'fs': { 'rose': 27 } }
 */
module.exports = {

  /** Rearranges the developer statistics to be descending */
  sortUses: function(map) {
    let result = new Map();
    while (map.size > 0) {
      let maxValueKey = map.keys().next().value; // Random key
      map.forEach((value, key) => {
        if (value > map.get(maxValueKey)) {
          maxValueKey = key;
        }
      });
      result.set(maxValueKey, map.get(maxValueKey));
      map.delete(maxValueKey);
    }
    return result;
  },

  /** Merges two uses datasets together */
  mergeUses: function(a, b) {
    b.forEach((_, callee) => {
      if (a.has(callee)) {
        b.get(callee).forEach((_, author) => {
          if (a.get(callee).has(author)) {
            a.get(callee).set(author, a.get(callee).get(author) + b.get(callee).get(author));
          } else {
            a.get(callee).set(author, b.get(callee).get(author));
          }
        });
      } else {
        a.set(callee, b.get(callee));
      }
    });
    return a;
  },

  serializeMap: function(map) {

  },

  deserializeMap: function(map) {

  }

}

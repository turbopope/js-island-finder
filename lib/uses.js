module.exports = {

  // Sorts a key -> Number map
  sortMap: function(map) {
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

  mergeUses: function(a, b) {
    // console.dir(a)
    // console.dir(b)
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
  }

}

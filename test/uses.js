const assert = require('assert');
const uses = require('../lib/uses');

describe('uses', function() {

  describe('#sortUses()', function() {
    it('should sort the map in descending order', function() {
      let map = new Map();
      map.set('jade', 2);
      map.set('john', 1);
      map.set('rose', 3);
      const valuesIterator = uses.sortUses(map).values();

      assert.equal(3, valuesIterator.next().value);
      assert.equal(2, valuesIterator.next().value);
      assert.equal(1, valuesIterator.next().value);
    });
  });
});

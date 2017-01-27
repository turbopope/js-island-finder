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

  describe('#mergeUses()', function() {
    it('should return b if a is empty', function() {
      let a = new Map();
      let b = new Map();
      b.set('fs', new Map());
      b.get('fs').set('john', 1);

      assert.deepEqual(b, uses.mergeUses(a, b));
    });
    it('should return a map with a and b', function() {
      let a = new Map();
      a.set('fs', new Map());
      a.get('fs').set('john', 2);
      let b = new Map();
      b.set('crypto', new Map());
      b.get('crypto').set('jade', 1);
      let ab = new Map();
      ab.set('crypto', new Map());
      ab.get('crypto').set('jade', 2);
      ab.set('fs', new Map());
      ab.get('fs').set('john', 1);

      assert.deepEqual(ab, uses.mergeUses(a, b));
    });
    it('should return a map with authors from a and b', function() {
      let a = new Map();
      a.set('fs', new Map());
      a.get('fs').set('john', 1);
      let b = new Map();
      b.set('fs', new Map());
      b.get('fs').set('jade', 2);
      let ab = new Map();
      ab.set('fs', new Map());
      ab.get('fs').set('john', 1);
      ab.get('fs').set('jade', 2);

      assert.deepEqual(ab, uses.mergeUses(a, b));
    });
    it('should increment use amounts', function() {
      let a = new Map();
      a.set('fs', new Map());
      a.get('fs').set('john', 1);
      let b = new Map();
      b.set('fs', new Map());
      b.get('fs').set('john', 1);
      let ab = new Map();
      ab.set('fs', new Map());
      ab.get('fs').set('john', 2);

      assert.deepEqual(ab, uses.mergeUses(a, b));
    });
  });

  describe('#serializeMap()', function() {
    it('should produce a json object', function() {
      let map = new Map();
      map.set('a', 1);
      map.set('b', 'b');
      assert.equal(
        '{a:1,b:"b"}',
        uses.serializeMap(map)
      );
    });
    it('should recurse through nested objects', function() {
      let map = new Map();
      let nestedMap = new Map();
      nestedMap.set('b', 'b');
      map.set('a', nestedMap);
      assert.equal(
        '{a:{b:"b"}}',
        uses.serializeMap(map)
      );
    });
    it('should reject invalid keys', function() {
      let mapWithObject = new Map();
      mapWithObject.set({}, 1);
      let mapWithArray = new Map();
      mapWithArray.set([], 1);
      let mapWithUndefined = new Map();
      mapWithUndefined.set(undefined, 1);

      assert.throws(function(){ uses.serializeMap(mapWithObject) }, Error);
      assert.throws(function(){ uses.serializeMap(mapWithArray) }, Error);
      assert.throws(function(){ uses.serializeMap(mapWithUndefined) }, Error);
    });
  });

  describe('#deserializeMap()', function() {
    it('should produce the expected map', function() {
      let expected = new Map();
      expected.set('a', 1);
      expected.set('b', 'b');
      assert.deepEqual(
        expected,
        uses.deserializeMap('{a:1,b:"b"}')
      );
    });
    it('should recurse through nested objects', function() {
      let expected = new Map();
      let nestedMap = new Map();
      nestedMap.set('b', 'b');
      expected.set('a', nestedMap);
      assert.equal(
        expected,
        uses.serializeMap('{a:{b:"b"}}')
      );
    });
    it('should reject invalid strings', function() {
      assert.throws(function(){ uses.deserializeMap('{iamlazy') }, Error);
    });
  });
});

const assert = require('chai').assert;
const util = require('../lib/util');

describe('util', function() {
  describe('#isMaximumInArray()', function() {
    it('should throw if element is not in ary', function() {
      assert.throws(function(){util.isMaximumInArray(3, [1, 2])}, Error);
    });
    it('should return true if element is the maximum', function() {
      assert.isTrue(util.isMaximumInArray(2, [1, 2]));
    });
    it('should return false if element is not the maximum', function() {
      assert.isFalse(util.isMaximumInArray(1, [1, 2]));
    });
  });

  describe('#chunkArray()', function() {
    it('chunk an array into chunks', function() {
      assert.deepEqual(util.chunkArray([0,1,2,3], 2), [[0,1], [2,3]]);
    });
    it('have the last chunk be incomplete', function() {
      assert.deepEqual(util.chunkArray([0,1,2,3,4], 2), [[0,1], [2,3], [4]]);
      assert.deepEqual(util.chunkArray([0], 2), [[0]]);
    });
    it('return an empty when given an empty array', function() {
      assert.deepEqual(util.chunkArray([], 1), []);
      assert.deepEqual(util.chunkArray([], 2), []);
    });
    it('should throw if chunkSize is 0', function() {
      assert.throws(function(){util.chunkArray([1,2], 0)}, Error);
    });
  });
});

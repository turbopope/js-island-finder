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
});

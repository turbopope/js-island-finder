const assert = require('chai').assert;
const Table = require('../lib/Table');

describe('Table', function() {

  let table;
  beforeEach(function() {
    table = new Table(0);
  })

  describe('#get()', function() {
    it('should get the date after setting it', function() {
      table.set('r', 'c', 1);
      assert.equal(1, table.get('r', 'c'));
    });
    it('should get the default if the date is not found', function() {
      assert.equal(0, table.get('r', 'c'));
    });
  });

  describe('#has()', function() {
    it('should return true if it has the date', function() {
      table.set('r', 'c', 1);
      assert.isTrue(table.has('r', 'c'));
    });
    it('should return false if it does not have the date', function() {
      assert.isFalse(table.has('r', 'c'));
    });
  });

  describe('#csv()', function() {
    it('should produce the expected CSV string (one date)', function() {
      table.set('r', 'c', 1);
      assert.equal(
        "???,c;\nr,1;\n",
        table.toCSV()
      );
    });
    it('should produce the expected CSV string (multiple dates with default)', function() {
      table.set('r1', 'c1', 1);
      table.set('r2', 'c2', 2);
      assert.equal(
        "???,c1,c2;\nr1,1,0;\nr2,0,2;\n",
        table.toCSV()
      );
    });
  });
});

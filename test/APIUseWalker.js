const assert = require('chai').assert;
const APIUseWalker = require('../lib/APIUseWalker');
const getAst = require('../lib/util').getAst;
const path = require('path');

describe('APIUseWalker', function() {
  describe('#pruneUnrequired()', function() {
    it('should retain uses of required variables', function() {
      let walker = new APIUseWalker(`${__dirname}/../`, __filename); // This is just a spoof to avoid Errors
      walker.record_use('fs', 'john');
      walker.record_use('crypto', 'jade');
      walker.record_require('fs', 'fs');
      walker.pruneUnrequired();
      assert.include(Array.from(walker._uses.keys()), 'fs');
    });
    it('should remove uses of unrequired variables', function() {
      let walker = new APIUseWalker(`${__dirname}/../`, __filename); // This is just a spoof to avoid Errors
      walker.record_use('fs', 'john');
      walker.record_use('crypto', 'jade');
      walker.record_require('fs', 'fs');
      walker.pruneUnrequired();
      assert.notInclude(Array.from(walker._uses.keys()), 'crypto');
    });
    it('should retain uses of global objects', function() {
      let walker = new APIUseWalker(`${__dirname}/../`, __filename); // This is just a spoof to avoid Errors
      walker.record_use('Array', 'john');
      walker.record_use('String', 'john');
      walker.record_use('Object', 'john');
      walker.record_use('Map', 'john');
      walker.record_use('JSON', 'john');
      walker.record_use('Promise', 'john');
      walker.pruneUnrequired();
      assert.include(Array.from(walker._uses.keys()), 'Array');
      assert.include(Array.from(walker._uses.keys()), 'String');
      assert.include(Array.from(walker._uses.keys()), 'Object');
      assert.include(Array.from(walker._uses.keys()), 'Map');
      assert.include(Array.from(walker._uses.keys()), 'JSON');
      assert.include(Array.from(walker._uses.keys()), 'Promise');
    });
  });

  describe('#pruneLocalModuleRequires()', function() {
    let walker;
    before(function() {
      walker = new APIUseWalker(`${__dirname}/../`, __filename); // This is just a spoof to avoid Errors
      walker.record_require('fs', 'fs');
      walker.record_require('request', 'request');
      walker.record_require('a', './a');
      walker.record_require('c', '../b/c');
      walker.pruneLocalModuleRequires();
    })

    it('should retain requires of node modules', function() {
      assert.include(Array.from(walker._requires.keys()), 'fs');
    });
    it('should retain requires of npm modules', function() {
      assert.include(Array.from(walker._requires.keys()), 'request');
    });
    it('should remove requires of internal modules', function() {
      assert.notInclude(Array.from(walker._requires.keys()), 'a');
      assert.notInclude(Array.from(walker._requires.keys()), 'c');
    });
  });

  describe('::VariableDeclaratorWatcher', function() {

    function getRequiresKeyVals(file) {
      walker = new APIUseWalker(path.resolve(__dirname, '..'), file); // Goes up one dir
      walker.handleNode(getAst(file));
      return keyVals = Array.from(walker._requires.entries());
    }

    it('should record let declarations', function() {
      const keyVals = getRequiresKeyVals('./test/src/require-let.js');
      assert.deepEqual(keyVals, [['fs', 'fs']]);
    });
    it('should record const declarations', function() {
      const keyVals = getRequiresKeyVals('./test/src/require-const.js');
      assert.deepEqual(keyVals, [['fs', 'fs']]);
    });
    it('should record var declarations', function() {
      const keyVals = getRequiresKeyVals('./test/src/require-var.js');
      assert.deepEqual(keyVals, [['fs', 'fs']]);
    });
    it('should record local requires', function() {
      const keyVals = getRequiresKeyVals('./test/src/require-local.js');
      assert.deepEqual(keyVals, [['util', './lib/util']]);
    });
    it('should record module requires', function() {
      const keyVals = getRequiresKeyVals('./test/src/require-module.js');
      assert.deepEqual(keyVals, [['chai', 'chai']]);
    });
    it('should ignore exports', function() {
      const keyVals = getRequiresKeyVals('./test/src/require-export.js');
      assert.deepEqual(keyVals, [['readFileSync', 'fs']]);
    });
  });

  describe('::IdentifierWatcher', function() {

    function getUsesKeys(file) {
      walker = new APIUseWalker(path.resolve(__dirname, '..'), file); // Goes up one dir
      walker.handleNode(getAst(file));
      return Array.from(walker._uses.keys());
    }

    it('should record uses of modules in CallExpressions', function() {
      const keys = getUsesKeys('./test/src/use-callexpression.js');
      assert.include(keys, 'readFileSync');
    });
    it('should record uses of modules in MemberExpressions', function() {
      const keys = getUsesKeys('./test/src/use-memberexpression.js');
      assert.include(keys, 'fs');
    });
    it('should record uses of modules in NewExpressions', function() {
      const keys = getUsesKeys('./test/src/use-newexpression.js');
      assert.include(keys, 'Promise');
    });
    it('should record uses of modules as arguments', function() {
      const keys = getUsesKeys('./test/src/use-as-argument.js');
      assert.include(keys, 'fs');
    });
    it('should record uses of modules as superclass', function() {
      const keys = getUsesKeys('./test/src/use-superclass.js');
      assert.include(keys, 'Promise');
    });
  });
});

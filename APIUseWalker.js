"use strict";

const ASTWalker = require('./ASTWalker');
const execSync = require('child_process').execSync;

class APIUseWalker extends ASTWalker {
  constructor(repo, file) {
    super();
    this._repo = repo;
    this._file = file;
    this._uses = {};

    this.add_watcher('CallExpression', callExpression => {
      const callee = callExpression.callee;
      const line = callExpression.loc.start.line;
      const type = callExpression.callee.type;
      let expName = '';

      switch (type) {
        case 'MemberExpression':
          expName = callee.object.name;
          break;
        case 'Identifier':
          expName = callee.name;
          break;
        case 'FunctionExpression':
          expName = '...';
          break;
        case 'CallExpression':
          expName = '...';
          break;
        case 'LogicalExpression':
          expName = '...';
          break;
        case 'NewExpression':
          expName = callee.name;
          break;
        case 'ConditionalExpression':
          expName = '...';
          break;
        case 'MetaProperty':
          expName = '...';
          break;
        case 'Super':
          expName = '...';
          break;
        default:
          throw `Unknown callee: ${callee.type}`;
      }

      const author = this.author(this._repo, this._file, line)
      this.record_use(expName, author);
      // console.log(`${line}: ${type} ${expName} by ${author}`);
    });
  }

  author(repo, file, line) {
    const cmd = `git blame -p -L ${line},${line} ${file}`;
    // console.log(`e xec ${cmd} in ${repo}`);
    const stdout = execSync(cmd, { cwd: repo, encoding: 'utf-8' });
    return stdout.split("\n")[1].replace('author ', '');
  }

  record_use(callee, author) {
    if (!this._uses.hasOwnProperty(callee)) {
      this._uses[callee] = {}
    }
    if (!this._uses[callee].hasOwnProperty(author)) {
      this._uses[callee][author] = 0;
    }
    this._uses[callee][author] = this._uses[callee][author] + 1;
  }

}


module.exports = APIUseWalker;

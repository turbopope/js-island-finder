"use strict";

const ASTWalker = require('./ASTWalker');
const exec = require('child_process').exec;

class APIUseWalker extends ASTWalker {
  constructor(repo, file) {
    super();
    this._repo = repo;
    this._file = file;

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

      this.author(this._repo, this._file, line, author => {
        console.log(`${line}: ${type} ${expName} by ${author}`);
      });
    });
  }

  author(repo, file, line, callback) {
    const cmd = `git blame -p -L ${line},${line} ${file}`;
    // console.log(`e xec ${cmd} in ${repo}`);
    exec(cmd, { cwd: repo }, (error, stdout, stderr) => {
      if (error) throw error;
      callback(`${stdout.split("\n")[1].replace('author ', '')}`);
    });
  }

}


module.exports = APIUseWalker;

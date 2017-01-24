"use strict";

const ASTWalker = require('./ASTWalker');
const execSync = require('child_process').execSync;

class APIUseWalker extends ASTWalker {
  constructor(repo, file) {
    super();
    this._repo = repo;
    this._file = file;
    this._uses = new Map();
    this._requires = new Map();

    this.add_watcher('VariableDeclarator', variableDeclarator => {
      // console.dir(variableDeclarator);

      if (
        variableDeclarator.init &&
        variableDeclarator.init.type == 'CallExpression' &&
        variableDeclarator.init.callee.name === 'require'
      ) {
        const vName = variableDeclarator.id.name;
        const mName = variableDeclarator.init.arguments[0].value;
        this._requires.set(vName, mName);
        console.log(`${vName} = require('${mName}')`);
      }
    });

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
    if (!this._uses.has(callee)) {
      this._uses.set(callee, new Map());
    }
    if (!this._uses.get(callee).has(author)) {
      this._uses.get(callee).set(author, 0);
    }
    this._uses.get(callee).set(author, this._uses.get(callee).get(author) + 1);
  }

  // Removes all calls on callees that have not been required
  pruneUnrequired() {
    const requires = this._requires;
    const uses = this._uses;
    var requiredAndUsed = new Map();
    this._requires.forEach((mName, vName) => {
      if (uses.has(vName)) {
        requiredAndUsed.set(vName, uses.get(vName));
      }
    });
    this._uses = requiredAndUsed;
  }

  // Removes all requires of local (non-npm) modules
  pruneLocalModuleRequires() {
    // console.dir(this._uses)
    // console.dir(this._requires)
    this._requires.forEach((mName, vName) => {
      if (mName.startsWith('.')) {
        this._requires.delete(vName);
      }
    });
  }

  // Resolves vNames to module names
  normalizeVNamesToModules() {
    this._requires.forEach((mName, vName) => {
      let temp = this._uses.get(vName); // Clone?
      if (temp === undefined) {
        // TODO: These were probably required for a reason. Investigate why they are not used.
        console.warn(`Unused required module ${vName} = ${mName}`);
        return;
      }
      this._uses.delete(vName);
      this._uses.set(mName, temp);
    });
  }

  // Call when all nodes have been handled
  finalize() {
    this.pruneLocalModuleRequires();
    this.pruneUnrequired();
    this.normalizeVNamesToModules();
  }

}


module.exports = APIUseWalker;

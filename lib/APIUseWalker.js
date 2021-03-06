"use strict";

const ASTWalker = require('./ASTWalker');
const globals = require('./globals');
const util = require('./util');
const execSync = require('child_process').execSync;
const fs = require('fs');

class APIUseWalker extends ASTWalker {
  constructor(repo, file) {
    super();
    this._repo = repo;
    this._file = file;
    this._uses = new Map();
    this._requires = new Map();
    this._linesToAuthors = new Map();

    const blame_cmd = `git blame -c -w -M15 -C ${file}`;
    const stdout = execSync(blame_cmd, { cwd: repo, encoding: 'utf-8' }).trim();
    const lines = stdout.split("\n");
    this._linesToAuthors = lines.map(line => { return line.split("\t")[1].substring(1).trim(); });

    this._globals = Object.keys(globals);

    this.add_watcher('VariableDeclarator', variableDeclarator => {
      if (variableDeclarator.init) {
        const vName = variableDeclarator.id.name;
        let mName;

        switch (variableDeclarator.init.type) {
          case 'CallExpression':
            if (variableDeclarator.init.callee.name !== 'require') return;
            if (!variableDeclarator.init.arguments[0].value) return;
            mName = variableDeclarator.init.arguments[0].value;
            break;
          case 'MemberExpression':
            if (!variableDeclarator.init.object.callee) return;
            if (variableDeclarator.init.object.callee.name !== 'require') return;
            if (!variableDeclarator.init.object.arguments[0].value) return;
            mName = variableDeclarator.init.object.arguments[0].value;
            break;
          default:
            return;
        }
        this.record_require(vName, mName);
      }
    });

    this.add_watcher('Identifier', identifier => {
      const line = identifier.loc.start.line;
      const author = this.author(line);
      this.record_use(identifier.name, author);
    });
  }

  author(line) {
    return this._linesToAuthors[line - 1]; // esprima starts the line numbers at 1
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

  record_require(vName, mName) {
    this._requires.set(vName, mName);
  }

  // Removes all calls on callees that have not been required
  pruneUnrequired() {
    const requires = this._requires;
    const uses = this._uses;
    const globals = this._globals;
    var requiredAndUsed = new Map();
    this._uses.forEach((stats, vName) => {
      if (requires.has(vName) || globals.includes(vName)) {
        requiredAndUsed.set(vName, uses.get(vName));
      }
    });
    this._uses = requiredAndUsed;
  }

  // Removes all requires of local (non-npm) modules
  pruneLocalModuleRequires() {
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
        // console.warn(`Unused required module ${vName} = ${mName}`);
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

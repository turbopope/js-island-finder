"use strict";

class ASTWalker {
  constructor() {
    this._watchers = {};
  }

  handleNode(node) {
    if (node === null) return;
    if (this._watchers.hasOwnProperty(node.type)) this._watchers[node.type](node);

    const props = Object.getOwnPropertyNames(node);
    props.forEach(propertyName => {
      const property = node[propertyName];
      if (property === null) { return; }
      if (Array.isArray(property)) {
        property.forEach(element => this.handleNode(element));
      } else if (property.hasOwnProperty('type')) {
        this.handleNode(property);
      } else {
        // Property is not a node
      }
    });
  }

  add_watcher(type, callback) {
    this._watchers[type] = callback;
  }
}


module.exports = ASTWalker;

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

  // handleNode(node) {
  //   if (node === null) { return; }
  //   switch(node.type){
  //     case 'Program': this.handleProgram(node); break;
  //     case 'ExpressionStatement': this.handleExpressionStatement(node); break;
  //     case 'CallExpression': this.handleCallExpression(node); break;
  //     case 'MemberExpression': this.handleMemberExpression(node); break;
  //     case 'Identifier': this.handleIdentifier(node); break;
  //     case 'Literal': this.handleLiteral(node); break;
  //     case 'BlockStatement': this.handleBlockStatement(node); break;
  //     case 'FunctionDeclaration': this.handleFunctionDeclaration(node); break;
  //     case 'AssignmentExpression': this.handleAssignmentExpression(node); break;
  //     case 'ObjectExpression': this.handleObjectExpression(node); break;
  //     case 'Property': this.handleProperty(node); break;
  //     case 'BinaryExpression': this.handleBinaryExpression(node); break;
  //     case 'VariableDeclaration': this.handleVariableDeclaration(node); break;
  //     case 'VariableDeclarator': this.handleVariableDeclarator(node); break;
  //     case 'FunctionExpression': this.handleFunctionExpression(node); break;
  //     case 'ConditionalExpression': this.handleConditionalExpression(node); break;
  //     case 'ReturnStatement': this.handleReturnStatement(node); break;
  //     case 'EmptyStatement': this.handleEmptyStatement(node); break;
  //     case 'ArrayExpression': this.handleArrayExpression(node); break;
  //     default: this.handleUnknownNode(node); break;
  //   }
  // }
  //
  // handleProgram(program) {
  //   program.body.forEach(node => this.handleNode(node));
  // }
  //
  // handleExpressionStatement(expressionStatement) {
  //   this.handleNode(expressionStatement.expression);
  // }
  //
  // handleCallExpression(callExpression) {
  //   this.handleNode(callExpression.callee);
  //   callExpression.arguments.forEach(argument => this.handleNode(argument));
  // }
  //
  // handleMemberExpression(memberExpression) {
  //   this.handleNode(memberExpression.object);
  //   this.handleNode(memberExpression.property);
  // }
  //
  // handleIdentifier(identifier) {
  //   // console.log(`Identifier: ${identifier.name}`);
  // }
  //
  // handleLiteral(literal) {
  //   // console.log(`Literal: ${literal.value}`);
  // }
  //
  // handleBlockStatement(blockStatement) {
  //   blockStatement.body.forEach(node => this.handleNode(node));
  // }
  //
  // handleFunctionDeclaration(functionDeclaration) {
  //   this.handleNode(functionDeclaration.id);
  //   functionDeclaration.params.forEach(node => this.handleNode(node));
  //   this.handleNode(functionDeclaration.body);
  // }
  //
  // handleAssignmentExpression(assignmentExpression) {
  //   this.handleNode(assignmentExpression.left);
  //   this.handleNode(assignmentExpression.right);
  // }
  //
  // handleObjectExpression(objectExpression) {
  //   objectExpression.properties.forEach(property => this.handleNode(property));
  // }
  //
  // handleProperty(objectExpression) {
  //   this.handleNode(objectExpression.key);
  //   this.handleNode(objectExpression.value);
  // }
  //
  // handleBinaryExpression(binaryExpression) {
  //   this.handleNode(binaryExpression.left);
  //   this.handleNode(binaryExpression.right);
  // }
  //
  // handleVariableDeclaration(variableDeclaration) {
  //   variableDeclaration.declarations.forEach(declaration => this.handleNode(declaration));
  // }
  //
  // handleVariableDeclarator(variableDeclarator) {
  //   this.handleNode(variableDeclarator.id);
  //   this.handleNode(variableDeclarator.init);
  // }
  //
  // handleFunctionExpression(functionExpression) {
  //   functionExpression.params.forEach(param => this.handleNode(param));
  //   this.handleNode(functionExpression.body);
  // }
  //
  // handleConditionalExpression(conditionalExpression) {
  //   this.handleNode(conditionalExpression.test);
  //   this.handleNode(conditionalExpression.consequent);
  //   this.handleNode(conditionalExpression.alternate);
  // }
  //
  // handleReturnStatement(returnStatement) {
  //   this.handleNode(returnStatement.argument);
  // }
  //
  // handleEmptyStatement(emptyStatement) {
  //   // Lol i dunno ¯\_(ツ)_/¯
  // }
  //
  // handleArrayExpression(arrayExpression) {
  //   arrayExpression.elements.forEach(element => this.handleNode(element));
  // }
  //
  // handleUnknownNode(node) {
  //   console.dir(node, { colors: true, depth: 2 });
  //   throw `Unknown node type: ${node.type}`;
  // }
}


module.exports = ASTWalker;

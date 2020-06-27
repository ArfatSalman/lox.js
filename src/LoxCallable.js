/* eslint-disable max-classes-per-file */
const {Environment} = require('./Environment');
class LoxCallable {
  Call(interpreter, args) {
    throw new Error('not implemented');
  }

  arity() {
    throw new Error('Not implemented');
  }
}

class LoxFunction extends LoxCallable {
  constructor(declaration) {
    super();
    this.declaration = declaration;
  }

  Call(interpreter, args) {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }
    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  arity() {
    return this.declaration.params.length;
  }

  toString() {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}

module.exports.LoxCallable = LoxCallable;
module.exports.LoxFunction = LoxFunction;

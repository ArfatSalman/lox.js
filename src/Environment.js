class Environment {
  constructor(enclosing) {
    this.values = new Map();
    if (enclosing !== undefined) {
      this.enclosing = enclosing;
    } else {
      this.enclosing = null;
    }
  }

  define(name, value) {
    this.values.set(name, value);
  }

  get(name) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }
    throw new Error(`Undef variable ${name.lexeme}`);
  }

  assign(name, value) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
    } else if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
    } else {
      throw new Error(`Undef var ${name.lexeme}`);
    }
  }
}


module.exports.Environment = Environment;

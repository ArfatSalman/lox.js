/* eslint-disable class-methods-use-this */
// eslint-disable-next-line max-classes-per-file
const TokenType = require('./TokenType');
const { Environment } = require('./Environment');
const { LoxCallable, LoxFunction } = require('./LoxCallable');

function evaluate(expr) {
  return expr.accept(this);
}

function isTruthy(value) {
  if (value === null) {
    return false;
  }
  // return Boolean(value);
  if (typeof value === 'boolean') {
    return value;
  }
  return true;
}

function isEqual(left, right) {
  // if (left === null && right === null) {
  //   return true;
  // }
  // if (left === null) {
  //   return false;
  // }

  return left === right;
}

const globals = new Environment();

class Clock extends LoxCallable {
  Call() {
    return Date.now() / 1000;
  }

  arity() {
    return 0;
  }

  toString() {
    return '<native fn>';
  }
}

class Interpreter {

  constructor() {
    this.environment = globals;

    globals.define('clock', new Clock());
  }

  static get globals() {
    return globals;
  }

  interpret(statements) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
      // return evaluate.call(this, expr);
    } catch (e) {
      console.log(e);
    }
  }

  execute(stmt) {
    stmt.accept(this);
  }

  visitBinaryExpr(expr) {
    const left = evaluate.call(this, expr.left);
    const right = evaluate.call(this, expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS: {
        return left - right;
      }
      case TokenType.PLUS: {
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left + right;
        }
        break;
      }
      case TokenType.SLASH: {
        return left / right;
      }
      case TokenType.STAR: {
        return left * right;
      }
      case TokenType.GREATER: {
        return left > right;
      }
      case TokenType.GREATER_EQUAL: {
        return left >= right;
      }
      case TokenType.LESS: {
        return left < right;
      }
      case TokenType.LESS_EQUAL: {
        return left <= right;
      }
      case TokenType.BANG_EQUAL: {
        return !isEqual(left, right);
      }
      case TokenType.EQUAL_EQUAL: {
        return isEqual(left, right);
      }
      default:
        break;
    }
  }

  visitLiteralExpr(expr) {
    return expr.value;
  }

  visitGroupingExpr(expr) {
    return evaluate.call(this, expr.expression);
  }

  visitUnaryExpr(expr) {
    const right = evaluate.call(this, expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG: {
        return !isTruthy(right);
      }
      case TokenType.MINUS: {
        return -right;
      }
      default: {
        break;
      }
    }
    return null;
  }

  visitExpressionStmt(stmt) {
    evaluate.call(this, stmt.expression);
    return null;
  }

  visitPrintStmt(stmt) {
    const value = evaluate.call(this, stmt.expression);
    console.log(value.toString());
    return null;
  }

  visitVarStmt(stmt) {
    let value = null;
    if (stmt.initializer !== null) {
      value = evaluate.call(this, stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  visitVariableExpr(expr) {
    return this.environment.get(expr.name);
  }

  visitAssignExpr(expr) {
    const value = evaluate.call(this, expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  executeBlock(statements, environment) {
    const previous = this.environment;
    try {
      this.environment = environment;
      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitBlockStmt(stmt) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return null;
  }

  visitFunctionStmt(stmt) {
    const fun = new LoxFunction(stmt);
    this.environment.define(stmt.name.lexeme, fun);
    return null;
  }

  visitIfStmt(stmt) {
    if (isTruthy(evaluate.call(this, stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  visitLogicalExpr(expr) {
    const left = evaluate.call(this, expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (isTruthy(left)) {
        return left;
      }
    } else {
      if (!isTruthy(left)) {
        return left;
      }
    }

    return evaluate.call(this, expr.right);
  }

  visitWhileStmt(stmt) {
    while (isTruthy(evaluate.call(this, stmt.condition))) {
      this.execute(stmt.body);
    }
    return null;
  }

  visitCallExpr(expr) {
    const callee = evaluate.call(this, expr.callee);
    
    if (expr.args.length !== callee.arity()) {
      // arity check
    }

    const args = [];
    for (const arg of expr.args) {
      args.push(evaluate.call(this, arg));
    }
    if (!(callee instanceof LoxCallable)) {
      // error
    }
    return callee.Call(this, args);
  }
}

module.exports.Interpreter = Interpreter;

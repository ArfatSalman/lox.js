/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
const TokenType = require('./TokenType');
const {
  Binary,
  Unary,
  Literal,
  Grouping,
  Variable,
  Assign,
  Logical,
  Call,
} = require('./Expr');
const { Print, Expression, Var, Block, If, While, Function } = require('./Stmt');
const LoxExport = require('./Lox');
const log = require('./utils/log');

class ParseError extends Error {}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  match(...types) {
    for (const tokenType of types) {
      if (this.check(tokenType)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(tokenType) {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type === tokenType;
  }

  advance() {
    if (!this.isAtEnd()) {
      this.current += 1;
    }
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  consume(tokenType, message) {
    if (this.check(tokenType)) {
      return this.advance();
    }
    throw this.error(this.peek(), message);
  }

  // eslint-disable-next-line class-methods-use-this
  error(token, message) {
    LoxExport.Lox.error(token, message);
    return new ParseError();
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      // eslint-disable-next-line default-case
      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  expression() {
    return this.assignment();
  }

  or() {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }
    return expr;
  }

  and() {
    let expr = this.equality();
    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }
    return expr;
  }

  assignment() {
    const expr = this.or();
    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const { name } = expr;
        return new Assign(name, value);
      }

      this.error(equals, 'Invalid assignment target');
    }
    return expr;
  }

  equality() {
    // equality → comparison ( ( "!=" | "==" ) comparison )* ;
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  comparison() {
    // comparison → addition ( ( ">" | ">=" | "<" | "<=" ) addition )* ;
    let expr = this.addition();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  addition() {
    // addition → multiplication ( ( "-" | "+" ) multiplication )* ;
    let expr = this.multiplication();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  multiplication() {
    // multiplication → unary ( ( "/" | "*" ) unary )* ;
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  unary() {
    // unary → ( "!" | "-" ) unary | primary ;
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const expr = this.unary();
      return new Unary(operator, expr);
    }

    return this.call();
  }

  call() {
    let expr = this.primary();
    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }
    return expr;
  }

  finishCall(callee) {
    const args = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      args.push(this.expression());
      while (this.match(TokenType.COMMA)) {
        if (args.length >= 255) {
          this.error(this.peek(), 'Cannot have more than 255 arguments.');
        }
        args.push(this.expression());
      }
    }
    const paren = this.consume(TokenType.RIGHT_PAREN, 'finishCall: Expect ) after args');
    return new Call(callee, paren, args);
  }

  primary() {
    // primary → NUMBER | STRING | "false" | "true" | "nil" | "(" expression ")" ;
    if (this.match(TokenType.FALSE)) {
      return new Literal(false);
    }
    if (this.match(TokenType.TRUE)) {
      return new Literal(true);
    }
    if (this.match(TokenType.NIL)) {
      return new Literal(null);
    }
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }
    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, 'Expected )');
      return new Grouping(expr);
    }
    throw this.error(this.peek(), 'Expected expression');
  }

  printStatement() {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expected a ;');
    console.log({ value });
    return new Print(value);
  }

  expressionStatement() {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expected a ;');
    return new Expression(expr);
  }

  block() {
    const statements = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, 'Expect } after block');
    return statements;
  }

  ifStatement() {
    this.consume(TokenType.LEFT_PAREN, 'Expected left paren');
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, 'Expected right paren');

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }
    return new If(condition, thenBranch, elseBranch);
  }

  whileStatement() {
    this.consume(TokenType.LEFT_PAREN, 'Expected left paren');
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, 'Expected right paren');

    const body = this.statement();
    return new While(condition, body);
  }

  forStatement() {
    this.consume(TokenType.LEFT_PAREN, 'Expected left paren');
    let initializer = null;
    if (this.match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenType.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenType.SEMICOLON, 'Expect ";" after loop condition.');

    let increment = null;
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PAREN, 'Expect ")" after for-loop.');

    let body = this.statement();

    if (increment !== null) {
      body = new Block([body, new Expression(increment)]);
    }

    if (condition === null) {
      condition = new Literal(true);
    }

    body = new While(condition, body);

    if (initializer !== null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  statement() {
    if (this.match(TokenType.FOR)) {
      return this.forStatement();
    }
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return new Block(this.block());
    }
    return this.expressionStatement();
  }

  varDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name');
    let initializer = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }
    this.consume(TokenType.SEMICOLON, 'Expect a ; after decl');
    return new Var(name, initializer);
  }

  function_(kind) {
    const name = this.consume(TokenType.IDENTIFIER, 'ID expected');
    this.consume(TokenType.LEFT_PAREN, 'fn: left paren');
    const parameters = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      parameters.push(this.consume(TokenType.IDENTIFIER, 'fn: param name'));
      while (this.match(TokenType.COMMA)) {
        if (parameters.length >= 255) {
          this.error(this.peek(), 'too many args');
        }
        parameters.push(this.consume(TokenType.IDENTIFIER, 'fn: param name'));
      }
    }
    this.consume(TokenType.RIGHT_PAREN, 'fn: right paren');
    this.consume(TokenType.LEFT_BRACE, 'fn: left brace');
    const body = this.block();
    return new Function(name, parameters, body);
  }

  declaration() {
    try {
      if (this.match(TokenType.FUN)) {
        return this.function_("function");
      }
      if (this.match(TokenType.VAR)) {
        return this.varDeclaration();
      }
      return this.statement();
    } catch (ex) {
      console.log(ex);
      this.synchronize();
      return null;
    }
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      const stmt = this.declaration();
      statements.push(stmt);
    }
    return statements;
    // try {
    //   return this.expression();
    // } catch (e) {
    //   // console.log(e);
    //   return null;
    // }
  }
}

module.exports.Parser = Parser;

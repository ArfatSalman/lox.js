const TokenType = require('./TokenType');
const { Token } = require('./Token');
const LoxExport = require('./Lox');

const keywords = new Map([
  ['and', TokenType.AND],
  ['class', TokenType.CLASS],
  ['else', TokenType.ELSE],
  ['false', TokenType.FALSE],
  ['for', TokenType.FOR],
  ['fun', TokenType.FUN],
  ['if', TokenType.IF],
  ['nil', TokenType.NIL],
  ['or', TokenType.OR],
  ['print', TokenType.PRINT],
  ['return', TokenType.RETURN],
  ['super', TokenType.SUPER],
  ['this', TokenType.THIS],
  ['true', TokenType.TRUE],
  ['var', TokenType.VAR],
  ['while', TokenType.WHILE],
]);

function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isAlpha(char) {
  const isLowerCase = (char >= 'a' && char <= 'z');
  const isUpperCase = (char >= 'A' && char <= 'Z');
  const isUnderscore = char === '_';
  return isLowerCase || isUpperCase || isUnderscore;
}

function isAlphaNumeric(char) {
  return isAlpha(char) || isDigit(char);
}


class Scanner {
  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  advance() {
    this.current += 1;
    return this.source.charAt(this.current - 1);
  }

  addToken(tokenType, literal = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(tokenType, text, literal, this.line));
  }

  match(expected) {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) !== expected) {
      return false;
    }
    this.current += 1;
    return true;
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  peek() {
    if (this.isAtEnd()) {
      return '\0';
    }
    return this.source.charAt(this.current);
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }
    return this.source.charAt(this.current + 1);
  }

  string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line += 1;
      }
      this.advance();
    }
    if (this.isAtEnd()) {
      LoxExport.Lox.error(this.line, 'Unterminated String');
    }

    this.advance();
    const str = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, str);
  }

  identifier() {
    while (isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const ident = this.source.substring(this.start, this.current);
    let type = keywords.get(ident);
    if (type === undefined) {
      type = TokenType.IDENTIFIER;
    }
    this.addToken(type);
  }

  number() {
    while (isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === '.' && isDigit(this.peekNext())) {
      this.advance();
      while (isDigit(this.peek())) {
        this.advance();
      }
    }

    const num = this.source.substring(this.start, this.current);
    this.addToken(TokenType.NUMBER, Number.parseFloat(num));
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '!': {
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      }
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/': {
        if (this.match('*')) {
          while (this.peek() !== '*' && !this.isAtEnd()) {
            this.advance();
          }

          // handle the last slash
        }
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      }
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      case '\n':
        this.line += 1;
        break;
      case '"':
        this.string();
        break;
      default: {
        if (isDigit(c)) {
          this.number();
        } else if (isAlpha(c)) {
          this.identifier();
        } else {
          LoxExport.Lox.error(this.line, 'Unexpected character');
        }
        break;
      }
    }
  }
}

module.exports.Scanner = Scanner;

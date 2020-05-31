module.exports = {
  // Single-character tokens.
  LEFT_PAREN: Symbol('LEFT_PAREN'),
  RIGHT_PAREN: Symbol('RIGHT_PAREN'),
  LEFT_BRACE: Symbol('LEFT_BRACE'),
  RIGHT_BRACE: Symbol('RIGHT_BRACE'),
  COMMA: Symbol('COMMA'),
  DOT: Symbol('DOT'),
  MINUS: Symbol('MINUS'),
  PLUS: Symbol('PLUS'),
  SEMICOLON: Symbol('SEMICOLON'),
  SLASH: Symbol('SLASH'),
  STAR: Symbol('STAR'),

  // One or two character tokens.
  BANG: Symbol('BANG'),
  BANG_EQUAL: Symbol('BANG_EQUAL'),
  EQUAL: Symbol('EQUAL'),
  EQUAL_EQUAL: Symbol('EQUAL_EQUAL'),
  GREATER: Symbol('GREATER'),
  GREATER_EQUAL: Symbol('GREATER_EQUAL'),
  LESS: Symbol('LESS'),
  LESS_EQUAL: Symbol('LESS_EQUAL'),

  // Literals.
  IDENTIFIER: Symbol('IDENTIFIER'),
  STRING: Symbol('STRING'),
  NUMBER: Symbol('NUMBER'),

  // Keywords.
  AND: Symbol('AND'),
  CLASS: Symbol('CLASS'),
  ELSE: Symbol('ELSE'),
  FALSE: Symbol('FALSE'),
  FUN: Symbol('FUN'),
  FOR: Symbol('FOR'),
  IF: Symbol('IF'),
  NIL: Symbol('NIL'),
  OR: Symbol('OR'),
  PRINT: Symbol('PRINT'),
  RETURN: Symbol('RETURN'),
  SUPER: Symbol('SUPER'),
  THIS: Symbol('THIS'),
  TRUE: Symbol('TRUE'),
  VAR: Symbol('VAR'),
  WHILE: Symbol('WHILE'),

  EOF: Symbol('EOF'),
};

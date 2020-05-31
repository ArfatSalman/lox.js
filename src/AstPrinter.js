function parenthesize(name, ...exprs) {
  let output = `(${name}`;
  for (const expr of exprs) {
    output += ' ';
    output += expr.accept(this);
  }
  output += ')';
  return output;
}

class AstPrinter {
  print(expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr) {
    return parenthesize.call(this, expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr) {
    return parenthesize.call(this, 'group', expr.expression);
  }

  // eslint-disable-next-line class-methods-use-this
  visitLiteralExpr(expr) {
    if (expr.value === null) {
      return 'nil';
    }
    return expr.value.toString();
  }

  visitUnaryExpr(expr) {
    return parenthesize.call(this, expr.operator.lexeme, expr.right);
  }
}

module.exports.AstPrinter = AstPrinter;

const fs = require('fs').promises;
const path = require('path');

function defineType(baseName, className, fieldList) {
  const fields = fieldList.split(',');
  return `
class ${className} extends ${baseName} {
  constructor(${fieldList}) {
    super();
${fields
  .map((field) => `    this.${field.trim()} = ${field.trim()};`)
  .join('\n')}
  }

  accept(visitor) {
    return visitor.visit${className}${baseName}(this);
  }
}
`;
}

function defineAst(baseName, types) {
  // AST classes
  const typeList = [];
  const classNames = [];
  for (const type of types) {
    const [className, fields] = type.split(':');
    const generatedType = defineType(baseName, className.trim(), fields.trim());
    typeList.push(generatedType);
    classNames.push(className.trim());
  }

  const fileContent = `/* eslint-disable max-classes-per-file */

class ${baseName} {
  constructor() {

  }
}
${typeList.join('\n')}
module.exports.${baseName} = ${baseName};
${classNames
  .map((className) => `module.exports.${className} = ${className};`)
  .join('\n')}
`;
  return fileContent;
}

async function main() {
  const outputDir = process.argv[2];
  if (outputDir === undefined) {
    console.log('Usage: generateAst <output directory>');
    process.exit(1);
  }

  const exprFilePath = `${path.join(outputDir, 'Expr')}.js`;
  const exprClasses = defineAst('Expr', [
    'Assign : name, value',
    'Binary : left, operator, right',
    'Grouping : expression',
    'Literal : value',
    'Logical : left, operator, right',
    'Unary: operator, right',
    'Variable: name',
  ]);

  const stmtClasses = defineAst('Stmt', [
    'Block : statements',
    'Expression : expression',
    'If : condition, thenBranch, elseBranch',
    'Print : expression',
    'Var : name, initializer',
    'While : condition, body',
  ]);

  const stmtFilePath = `${path.join(outputDir, 'Stmt')}.js`;

  await fs.writeFile(exprFilePath, exprClasses, 'utf-8');
  await fs.writeFile(stmtFilePath, stmtClasses, 'utf-8');
}

main().catch(console.error);

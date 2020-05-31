const fs = require('fs');
const { Input } = require('./utils/readline');
const { Scanner } = require('./Scanner');
const { Parser } = require('./Parser');
const { Token } = require('./Token');
const TokenType = require('./TokenType');
const { AstPrinter } = require('./AstPrinter');
const { Interpreter } = require('./Interpreter');

const interpreter = new Interpreter();

let hadError = false;

class Lox {
  static main() {
    if (process.argv.length > 3) {
      console.log('Usage: lox [script]');
      process.exit(64);
    } else if (process.argv[2] !== undefined) {
      Lox.runFile(process.argv[2]);
    } else {
      Lox.runPrompt().catch(console.log);
    }
  }

  static async runPrompt() {
    const input = new Input();
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const command = await input.readline('> ');
      if (command === 'exit') {
        break;
      }
      Lox.run(command);
      hadError = false;
    }
    input.close();
  }

  static runFile(filename) {
    const source = fs.readFileSync(filename, 'utf-8');
    Lox.run(source);
  }

  static error(lineOrToken, message) {
    if (lineOrToken instanceof Token) {
      const token = lineOrToken;
      if (token.type === TokenType.EOF) {
        Lox.report(token.line, ' at end', message);
      } else {
        Lox.report(token.line, " at '" + token.lexeme + "'", message);
      }
    } else {
      Lox.report(lineOrToken, '', message);
    }
  }

  static report(line, where, message) {
    console.log(`[line ${line}] Error${where}: ${message}`);
    hadError = true;
  }

  static run(source) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    // console.log(tokens);
    const parser = new Parser(tokens);
    const statements = parser.parse();
    // if (hadError) {
    //   return;
    // }
    // console.log(JSON.stringify(statements, null, 2));
    // console.log(new AstPrinter().print(expression));
    interpreter.interpret(statements);
  }
}

module.exports.Lox = Lox;

if (require.main === module) {
  Lox.main();
}

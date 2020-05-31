const Readline = require('readline');

class Input {
  constructor() {
    this.IReadline = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  readline(question) {
    return new Promise((res) => {
      this.IReadline.question(question, (answer) => {
        res(answer.trim());
      });
    });
  }

  close() {
    this.IReadline.close();
  }
}

module.exports = {
  Input,
};

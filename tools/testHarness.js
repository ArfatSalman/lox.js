const path = require('path');
const { promisify } = require('util');
const { readFile } = require('fs').promises;
const { lstatSync, readdirSync } = require('fs');
const cp = require('child_process');
const R = require('ramda');
const { red, green, yellowBright: yellow } = require('chalk');

const exec = promisify(cp.exec);

function getTestFilePaths(topFolder = 'tests') {
  const files = readdirSync(topFolder);
  let onlyFiles = [];
  for (const file of files) {
    const currentPath = path.join(topFolder, file);
    if (lstatSync(currentPath).isDirectory()) {
      onlyFiles = onlyFiles.concat(getTestFilePaths(currentPath));
    } else {
      onlyFiles.push(currentPath);
    }
  }
  return onlyFiles;
}

const getExpectations = (fileContent) => {
  const expectMatcher = /expect:\s(.*)$/;
  const lines = fileContent.split('\n');
  const result = [];
  for (const line of lines) {
    const match = line.match(expectMatcher);
    if (match !== null) {
      const [, rhs] = match;
      const { input } = match;
      result.push([input, rhs]);
    }
  }
  return result;
};

async function runLoxTest(tests) {
  for (const testFilePath of tests) {
    console.log(`Running ${yellow(testFilePath)}`);
    let content;
    try {
      content = await readFile(testFilePath, 'utf-8');
    } catch (ex) {
      console.log(`${testFilePath} file not found!`);
    }
    const { stdout } = await exec(`node src/Lox.js ${testFilePath}`);
    const loxResults = stdout.split('\n');

    const expectations = getExpectations(content);

    for (const [actualValue, expected] of R.zip(loxResults, expectations)) {
      const [line, expectedValue] = expected;
      if (expectedValue !== actualValue) {
        console.log(
          `Failed: ${yellow(line)}\n\tExpected ${green(
            expectedValue,
          )} got ${red(actualValue)}`,
        );
      }
    }
  }
}

runLoxTest(getTestFilePaths());
// runLoxTest([
// 'tests/number/nan_equality.lox',
// ]);

const util = require('util');

module.exports = function (obj) {
  console.log(util.inspect(obj, { showHidden: true, depth: Infinity, colors: true }));
}
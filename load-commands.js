const glob = require('glob');

const files = glob.sync('./commands/*.js');

module.exports = files.reduce((exports, filename) => {
  const command = filename.split(/[\/]/).reverse()[0].replace(/\.js/, '');
  return Object.assign({}, exports, { [command]: require(filename)});
}, {});
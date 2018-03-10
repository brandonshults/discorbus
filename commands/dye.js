const { commandKey } = require('../bot/config');
const { WRONG_ARGUMENTS } = require('../bot/constants');
const dyes = require('../dyes/dyes.json');

const allDyes = Object.assign({}, dyes.primary, dyes.accent);

module.exports = Object.freeze({
  usage: `${commandKey}dye (color)
  Primary Dyes: ${Object.keys(dyes.primary).join(', ')}
  Accent Dyes: ${Object.keys(dyes.accent).join(', ')}
  `,
  fn: function (commandArgs, message) {
    const color = commandArgs.join(' ').toLowerCase();
    if (color in allDyes) {
      return message.channel.send(allDyes[color]);
    } else {
      return Promise.resolve(WRONG_ARGUMENTS);
    }
  }
});

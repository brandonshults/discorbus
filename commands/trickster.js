const { commandKey } = require('../bot/config');
const { DISCORBUS_TESTING_GUILD_ID, ARC_GUILD_ID } = require('../bot/constants');
const formattedTimeUntil = require('../chest-timer/formatted-time-until');

module.exports = Object.freeze({
  usage: `${commandKey}trickster`,
  fn: function (commandArgs, message) {
    if ([DISCORBUS_TESTING_GUILD_ID, ARC_GUILD_ID].indexOf(message.channel.guild.id) === -1) {
      return Promise.resolve();
    }

    return message.channel.send(`Next chest at: ${formattedTimeUntil()}`);
  }
});

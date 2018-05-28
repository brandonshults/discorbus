const moment = require('moment-timezone');
const { commandKey } = require('../bot/config');
const { DISCORBUS_TESTING_GUILD_ID, ARC_GUILD_ID } = require('../bot/constants');
const timeUntilNextChest = require('../chest-timer/time-until-next-chest');

module.exports = Object.freeze({
  usage: `${commandKey}trickster`,
  fn: function (commandArgs, message) {
    if ([DISCORBUS_TESTING_GUILD_ID, ARC_GUILD_ID].indexOf(message.channel.guild.id) === -1) {
      return Promise.resolve();
    }

    const nextChest = timeUntilNextChest();
    const seattleNextChest = moment.tz(nextChest, 'America/Los_Angeles');
    const newYorkNextChest = moment.tz(nextChest, 'America/New_York');
    return message.channel.send(`Next chest at: ${seattleNextChest.format('h:mma')}/${newYorkNextChest.format('h:mma')} ${seattleNextChest.format('z')}/${newYorkNextChest.format('z')}`);
  }
});

const { commandKey } = require('../bot/config');
const { INVALID_RESPONSE } = require('../bot/constants');
const { getServerTime } = require('../api/orbus-api');
const { addCommasToNumber } = require('../utils/bag-o-fun');

const getTimeIcon = hour => hour < 6 || hour > 20 ? ':crescent_moon:' : ':sunny:';

module.exports = Object.freeze({
  usage: `${commandKey}stats`,
  fn: function (commandArgs, message) {
    const earthquakeEmoji = message.guild.emojis.find('name', 'earthquake') || '| Players Online:';

    return getServerTime()
      .then(body => message.channel.send(`${getTimeIcon(body.hour)} ${body.time} ${earthquakeEmoji} ${addCommasToNumber(body.playersOnline)}`))
      .catch(err => {
        console.log(err);
        return INVALID_RESPONSE;
      });
  }
});
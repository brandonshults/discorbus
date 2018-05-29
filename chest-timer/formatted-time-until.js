const moment = require('moment-timezone');
const { nextChestTime } = require('../chest-timer/next-chest-time');

module.exports = function formattedTimeUntil () {
  const nextChest = nextChestTime();

  const seattleNextChest = moment.tz(nextChest, 'America/Los_Angeles');
  const newYorkNextChest = moment.tz(nextChest, 'America/New_York');
  return `${seattleNextChest.format('h:mma')}/${newYorkNextChest.format('h:mma')} ${seattleNextChest.format('z')}/${newYorkNextChest.format('z')}`;
};

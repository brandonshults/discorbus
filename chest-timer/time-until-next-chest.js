const moment = require('moment-timezone');

const SEED_TIMER = moment.tz('2018-05-20 06:30', 'America/Los_Angeles');
const HOURS_BETWEEN_CHEST_SPAWN = 10;
const MS_IN_AN_HOUR = 1000 * 60 * 60;

module.exports = function nextChestTimer () {
  const now = new Date();
  const timeSinceLastChest = moment(now).diff(SEED_TIMER) % (HOURS_BETWEEN_CHEST_SPAWN * MS_IN_AN_HOUR);
  const timeUntilNextChest = (HOURS_BETWEEN_CHEST_SPAWN * MS_IN_AN_HOUR) - timeSinceLastChest;

  return moment(now).add(timeUntilNextChest);
};
module.exports();

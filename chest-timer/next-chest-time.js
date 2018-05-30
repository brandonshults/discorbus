const moment = require('moment-timezone');
const { tricksterChestRespawnRate } = require('../bot/config');

const SEED_TIMER = moment.tz('2018-05-20 06:30', 'America/Los_Angeles');
const MS_IN_A_MINUTE = 1000 * 60;
const MS_IN_AN_HOUR = MS_IN_A_MINUTE * 60;

function nextChestTime () {
  const now = new Date();
  const timeSinceLastChest = moment(now).diff(SEED_TIMER) % (tricksterChestRespawnRate * MS_IN_AN_HOUR);
  const timeUntilNextChest = (tricksterChestRespawnRate * MS_IN_AN_HOUR) - timeSinceLastChest;

  return moment(now).add(timeUntilNextChest);
}

module.exports = {
  nextChestTime,
  MS_IN_A_MINUTE,
  MS_IN_AN_HOUR
};

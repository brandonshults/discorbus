const nodeSchedule = require('node-schedule');
const moment = require('moment-timezone');

const formattedTimeUntil = require('./formatted-time-until');
const { nextChestTime, MS_IN_A_MINUTE, MS_IN_AN_HOUR } = require('./next-chest-time');
const { TESTING_CHANNEL_ID, TRICKSTER_CHEST_CHANNEL_ID, TRICK_TAKER_ROLE_ID, TESTING_ROLE_ID, DISCORBUS_TESTING_GUILD_ID, ARC_GUILD_ID } = require('../bot/constants');

module.exports = function scheduleChestWarnings (client) {
  const tricksterRoleId = getTricksterRoleId(client);
  const broadcastChannel = getTricksterChannel(client);
  const nextChest = nextChestTime();
  const oneHourBefore = nextChest - MS_IN_AN_HOUR;
  const thirtyMinutesBefore = nextChest - (MS_IN_A_MINUTE * 30);
  const tenMinutesBefore = nextChest - (MS_IN_A_MINUTE * 10);
  const oneMinuteBefore = nextChest - MS_IN_A_MINUTE;
  // const testTime = nextChest - (MS_IN_AN_HOUR * 7) - (MS_IN_A_MINUTE * 22);

  const warningTimes = [ oneHourBefore, thirtyMinutesBefore, tenMinutesBefore, oneMinuteBefore ];
  warningTimes.forEach(date => {
    if (new Date().getTime() < date) {
      nodeSchedule.scheduleJob(date, () => {
        broadcastChannel.send(`${tricksterRoleId ? `<@&${tricksterRoleId}> ` : ''}Next trickster chest in ${getFormattedTimeDifference(date)}`);
      });
    }
  });

  nodeSchedule.scheduleJob(nextChest + (MS_IN_A_MINUTE), () => scheduleChestWarnings(client));
};

function getTricksterChannel (client) {
  return client.channels.get(TRICKSTER_CHEST_CHANNEL_ID) || client.channels.get(TESTING_CHANNEL_ID);
}

function getFormattedTimeDifference () {
  const chestDate = nextChestTime();
  const timeUntil = moment.duration(moment(chestDate).diff(new Date()), 'milliseconds');
  const hours = timeUntil.hours();
  const minutes = timeUntil.minutes() + 1;    // Account for weird server time differences

  return `${hours ? `${hours} hour${isPlural(hours) ? 's' : ''} ` : ''}${minutes} minute${isPlural(minutes) ? 's' : ''} at ${formattedTimeUntil()}`;
}

function isPlural (time) {
  return time !== 1;
}

function getTricksterRoleId (client) {
  if (client.guilds.get(ARC_GUILD_ID)) {
    return client.guilds.get(ARC_GUILD_ID).roles.get(TRICK_TAKER_ROLE_ID).id;
  } else if (client.guilds.get(DISCORBUS_TESTING_GUILD_ID)) {
    return client.guilds.get(DISCORBUS_TESTING_GUILD_ID).roles.get(TESTING_ROLE_ID).id;
  }

  return 0;
}

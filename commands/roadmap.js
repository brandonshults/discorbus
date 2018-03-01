const { commandKey } = require('../bot/config');

const moment = require('moment-timezone');

const roadmap =
  new Map([
    [moment.tz('2018-03-05 12:00', 'America/Chicago'), 'Dye! Warrior hit detection, improved tutorial, kill quests'],
    [moment.tz('2018-03-19 12:00', 'America/Chicago'), 'New talent system, journal tabs, fishing gear'],
    [moment.tz('2018-03-26 12:00', 'America/Chicago'), 'Shard dungeons'],
    [moment.tz('2018-04-09 12:00', 'America/Chicago'), 'Pet overhaul'],
    [moment.tz('2018-04-23 12:00', 'America/Chicago'), 'New world boss, tournament of mages, fishing updates'],
    [moment.tz('2018-05-07 12:00', 'America/Chicago'), 'Act 3, new PvP mechanics'],
    [moment.tz('2018-05-28 12:00', 'America/Chicago'), 'Raid dungeons']
  ]);

function formatDatesForOutput (dates, currentDate) {
  const formattedEntries = dates.map(date => {
    const days = Math.floor(moment.duration(date.diff(currentDate), 'milliseconds').asDays());

    return {
      date: date.format('MMM Do'),
      duration: `(${days}d):`,
      releaseNotes: roadmap.get(date)
    };
  });

  const longestDate = formattedEntries.reduce((longest, { date }) => date.length > longest ? date.length : longest, 0);
  const longestDuration = formattedEntries.reduce((longest, { duration }) => duration.length > longest ? duration.length : longest, 0);

  return formattedEntries.reduce((output, { date, duration, releaseNotes }, index) => {
    return output + `${index > 0 ? '\n' : ''}[${date.padEnd(longestDate, ' ')}]${duration.padEnd(longestDuration, ' ')} ${releaseNotes}`;
  }, '');
}

function getFormattedRoadmap () {
  const currentDate = moment.tz('America/Chicago');
  const futureDates = Array.from(roadmap.keys())
    .filter(dateToCheck => dateToCheck.diff(currentDate) >= 0)
    .sort((left, right) => left.isBefore(right) ? -1 : 1);

  const pastDates = Array.from(roadmap.keys())
    .filter(dateToCheck => dateToCheck.diff(currentDate) < 0)
    .sort((left, right) => left.isAfter(right) ? -1 : 1)
    .slice(0, 3);

  return `\`\`\`md
${futureDates.length > 0 ? 'Upcoming:\n' + formatDatesForOutput(futureDates, currentDate) : ''}

${pastDates.length > 0 ? 'Past:\n' + formatDatesForOutput(pastDates, currentDate) : ''}\`\`\``;
}

module.exports = {
  usage: `${commandKey}roadmap)`,
  fn: (args, message) => message.channel.send(getFormattedRoadmap())
};

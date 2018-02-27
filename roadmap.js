const moment = require('moment-timezone');

const dates =
  new Map([
    [moment.tz('2018-03-05 12:00', 'America/Chicago'), "warrior hit detection, improved tutorial, kill quests"],
    [moment.tz('2018-03-19 12:00', 'America/Chicago'), "new talent system, journal tabs, fishing gear"],
    [moment.tz('2018-03-26 12:00', 'America/Chicago'), "shard dungeons"],
    [moment.tz('2018-04-09 12:00', 'America/Chicago'), 'pet overhaul'],
    [moment.tz('2018-04-23 12:00', 'America/Chicago'), "new world boss, tournament of mages, fishing updates"],
    [moment.tz('2018-05-07 12:00', 'America/Chicago'), "act 3, new PvP mechanics"],
    [moment.tz('2018-05-28 12:00', 'America/Chicago'), "raid dungeons"]
  ]);

function getFormattedRoadmap() {
  const currentDate = moment.tz('America/Chicago');
  const futureDates = Array.from(dates.keys())
    .filter(dateToCheck => dateToCheck.diff(currentDate) >= 0)
    .sort((left, right) => left.isBefore(right) ? -1 : 1);

  const formattedEntries = futureDates.map(futureDate => {
    const days = Math.floor(moment.duration(futureDate.diff(currentDate), 'milliseconds').asDays());

    return {
      date: futureDate.format('MMM Do'),
      duration: `(${days}d):`,
      releaseNotes: dates.get(futureDate)
    }
  });

  const longestDate = formattedEntries.reduce((longest, { date }) => date.length > longest ? date.length : longest,0);
  const longestDuration = formattedEntries.reduce((longest, { duration }) => duration.length > longest ? duration.length : longest,0);

  return `\`\`\`md
${formattedEntries.reduce((output, { date, duration, releaseNotes}, index) => {
    return output + `${index > 0 ? '\n' : ''}[${date.padEnd(longestDate, ' ')}]${duration.padEnd(longestDuration, ' ')} ${releaseNotes}`;
  }, '')}\`\`\``
}

module.exports = {
  getFormattedRoadmap
};
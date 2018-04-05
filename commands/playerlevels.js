const moment = require('moment-timezone');
const { commandKey } = require('../bot/config');
const { WRONG_ARGUMENTS, INVALID_RESPONSE } = require('../bot/constants');
const getCharacterInfo = require('../api/orbus-api').getCharacterInfo;
const { addCommasToNumber } = require('../utils/bag-o-fun');

module.exports = Object.freeze({
  usage: `${commandKey}playerlevels (character)`,
  fn: function (commandArgs, message) {
    if (commandArgs.length < 1) {
      return Promise.resolve(WRONG_ARGUMENTS);
    }

    return getCharacterInfo(commandArgs[0], { cacheLength: 0 })
      .then(response => {
        if (response === INVALID_RESPONSE) {
          message.channel.send(`Sorry, Orbus's API could not find: ${commandArgs}`);
        } else {
          const timeUntil = moment.duration(response.timePlayed, 'seconds');
          const days = Math.floor(timeUntil.asDays());
          const hours = timeUntil.hours();
          const minutes = timeUntil.minutes();
          message.channel.send(`\`\`\`md
${response.characterName}${getFormattedGuildText(response.fellowshipName)}has played for ${days}d ${hours}h ${minutes}m

Battle Disciplines:
-------------------
Fishing: ${response.levels.fisher}
Musketeer: ${response.levels.orbhealer}
Ranger: ${response.levels.archer}
Runemage: ${response.levels.runemage}
Warrior: ${response.levels.swordboard}
  
Stats:
------
${formatProcessedStats(getProcessedStats(response))}\`\`\``);
        }
      });
  }
});

function getFormattedGuildText (guildName) {
  if (!guildName) {
    return ' the guildless ';
  } else if (guildName === 'Nox') {
    return ', champion of * Nox *, ';
  } else {
    return ` of ${guildName} `;
  }
}

function getProcessedStats (response) {
  return response.stats.reduce((stats, stat) => {
    switch (stat.name) {
      case 'shard_highest_level':
        return Object.assign({}, stats, {'Highest Shard': addCommasToNumber(parseInt(stat.record, 10))});
      case 'fish_totalweight':
        return Object.assign({}, stats, {'Pounds of Fish': addCommasToNumber(parseInt(stat.record, 10))});
      case 'contest_runemage':
        return Object.assign({}, stats, {'Runemage Contest': addCommasToNumber(parseInt(stat.record, 10))});
      case 'potions_brewed':
        return Object.assign({}, stats, {'Potions Brewed': addCommasToNumber(parseInt(stat.record, 10))});
      case 'monsters_killed':
        return Object.assign({}, stats, {'Monsters Killed': addCommasToNumber(parseInt(stat.record, 10))});
      case 'gathers':
        return Object.assign({}, stats, {'Resources Gathered': addCommasToNumber(parseInt(stat.record, 10))});
      case 'arenas_won':
        return Object.assign({}, stats, {'Arena Wins': addCommasToNumber(parseInt(stat.record, 10))});
      default:
        return Object.assign({}, stats);
    }
  }, {});
}

function formatProcessedStats (stats) {
  return Object.keys(stats)
    .map(stat => (`${stat}: ${stats[stat]}`))
    .join('\n');
}

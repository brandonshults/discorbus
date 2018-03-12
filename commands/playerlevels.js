const moment = require('moment-timezone');
const { commandKey } = require('../bot/config');
const { WRONG_ARGUMENTS, INVALID_RESPONSE } = require('../bot/constants');
const getCharacterInfo = require('../api/orbus-api').getCharacterInfo;

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
          message.channel.send(`\`\`\`ini
${response.characterName} ${getFormattedGuildText(response.fellowshipName)} has played for ${days}d ${hours}h ${minutes}m
Fishing: ${response.levels.fisher}
Musketeer: ${response.levels.orbhealer}
Ranger: ${response.levels.archer}
Runemage: ${response.levels.runemage}
Warrior: ${response.levels.swordboard}\`\`\``);
        }
      });
  }
});

function getFormattedGuildText (guildName) {
  if (!guildName) {
    return 'the guildless';
  } else if (guildName === 'Nox') {
    return 'champion of [Nox]';
  } else {
    return `of ${guildName}`;
  }
}

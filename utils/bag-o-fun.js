const { whiteList, guildies } = require('../bot/config');

module.exports.isGuildy = name => guildies.map(guildy => guildy.toLowerCase()).indexOf(name.toLowerCase()) > -1;

module.exports.isBotMessage = message => message.author.bot;

module.exports.addCommasToNumber = number => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

module.exports.isWhiteListed = message => {
  const whiteListedRoleIds = whiteList.roles.map(role => role.id);
  return message.member._roles.filter(role => whiteListedRoleIds.indexOf(role) !== -1).length > 0;
};
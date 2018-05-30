const { whiteList } = require('../bot/config');

module.exports.isBotMessage = message => message.author.bot;

module.exports.addCommasToNumber = number => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

module.exports.isWhiteListed = message => {
  const whiteListedRoleIds = whiteList.roles.map(role => role.id);
  return message.member._roles.filter(role => whiteListedRoleIds.indexOf(role) !== -1).length > 0;
};

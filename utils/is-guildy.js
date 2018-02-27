const { whiteList } = require('../config');

module.exports = function isGuildy(name) {
  return whiteList.users.map(user => user.name.toLowerCase()).indexOf(name.toLowerCase()) > -1
}
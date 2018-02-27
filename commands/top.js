const api = require('../api/orbus-api');
const isGuildy = require('../utils/is-guildy');
const numberWithCommas = require('../utils/number-with-commas');
const { commandKey } = require('../config');
const { INVALID_RESPONSE, WRONG_ARGUMENTS } = require('../constants');
function getValidLeaderboards() {
  return Object.keys(api.LEADERBOARD_URLS);
}

function generateLeaderBoard(leaders) {
  const longestName = leaders.reduce((most, leader) => {
    const currentLength = leader.name.length;
    return currentLength > most ? currentLength : most;
  }, 0);
  const leaderboard = leaders.reduce((stringBuilder, leader) =>
    stringBuilder + (isGuildy(leader.name) ? '+' : ' ') + `${leader.name.padEnd(longestName + 2)}${numberWithCommas(leader.record)}\n`
    , '');
  return '```diff\n' + leaderboard + '```';
}

module.exports = {
  usage: `${commandKey}top (${getValidLeaderboards().join('|')})`,
  fn: (commandArgs, message) => {
    if(commandArgs === undefined) {
      return Promise.resolve(WRONG_ARGUMENTS);
    }

    const leaderboard = commandArgs[0];
    if(getValidLeaderboards().indexOf(leaderboard) > -1) {
      return api.getLeaderBoard(leaderboard)
        .then(response => message.channel.send(generateLeaderBoard(response)))
        .catch(err => {
          return INVALID_RESPONSE;
        });
    } else {
      return Promise.resolve(WRONG_ARGUMENTS);
    }
  }
};
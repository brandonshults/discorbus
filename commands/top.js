const api = require('../api/orbus-api');
const { addCommasToNumber } = require('../utils/bag-o-fun');
const { isGuildy } = require('../api/orbus-api');

const { commandKey } = require('../bot/config');
const { WRONG_ARGUMENTS, INVALID_RESPONSE } = require('../bot/constants');

const getValidLeaderboards = () => Object.keys(api.LEADERBOARD_URLS);

function generateLeaderBoard (leaders, boardname) {
  const longestName = leaders.reduce((most, leader) => {
    const currentLength = leader.name.length;
    return currentLength > most ? currentLength : most;
  }, 0);
  const leaderboard = leaders.reduce((stringBuilder, leader) =>
    stringBuilder + (leader.isGuildy ? '+' : ' ') + `${leader.name.padEnd(longestName + 2)}${addCommasToNumber(leader.record)}\n`
    , '');
  return `Results for: ${commandKey}top ${boardname}\n\`\`\`diff\n${leaderboard}\`\`\``;
}

module.exports = Object.freeze({
  usage: `${commandKey}top (${getValidLeaderboards().join('|')})`,
  fn: function (commandArgs, message) {
    if (commandArgs.length === 0) {
      return Promise.resolve(WRONG_ARGUMENTS);
    }

    const leaderboard = commandArgs[0];
    if (getValidLeaderboards().indexOf(leaderboard) > -1) {
      return api.getLeaderBoard(leaderboard)
        .then(response => Promise.all(
          response.map(entry => isGuildy(entry.name)
            .then(isGuildy => Object.assign({}, entry, { isGuildy }))))
          .then(entries => message.channel.send(generateLeaderBoard(entries, leaderboard))))
        .catch(err => {
          console.log(err);
          return INVALID_RESPONSE;
        });
    } else {
      return Promise.resolve(WRONG_ARGUMENTS);
    }
  }
});

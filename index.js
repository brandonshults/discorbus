const Discord = require('discord.js');
const api = require('./api/orbus-api');
const RESPONSE_TYPES = require('./api/response-types');
const whitelist = require('./whitelist.json');
const getFormattedRoadmap = require('./roadmap').getFormattedRoadmap;

const client = new Discord.Client();

const COMMAND_KEY = '!';

const TOP_REGEXP = new RegExp(`^${COMMAND_KEY}top (.+)`);

const authToken = process.env.AUTH_TOKEN;

const environment = process.env.NODE_ENV;

client.login(authToken);

client.on('ready', () => {
  console.log('Logged in');
});

client.on('message', message => {
  const content = message.content;

  if (!isWhitelisted(message)) {
    return;
  }

  const topCommand = TOP_REGEXP.exec(content);
  if (topCommand) {
    return api.getLeaderBoard(topCommand[1])
      .then(response => {
        if (response === RESPONSE_TYPES.INVALID_RESPONSE) {
          message.channel.send(`Usage: ${COMMAND_KEY}top (${getValidLeaderboards().join('|')})`);
        } else {
          message.channel.send(generateLeaderBoard(response))
        }
      });
  } else if(content === `${COMMAND_KEY}roadmap`) {
    message.channel.send(getFormattedRoadmap());
  }
});

function isWhitelisted(message) {
  const validRoleIds = whitelist.roles.map(role => role.id);
  return environment !== "production" || message.member._roles.filter(role => validRoleIds.indexOf(role) !== -1).length > 0;
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

function isGuildy(name) {
  return whitelist.users.map(user => user.name.toLowerCase()).indexOf(name.toLowerCase()) > -1
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getValidLeaderboards() {
  return Object.keys(api.LEADERBOARD_URLS);
}

function toUpperFirstCharacter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

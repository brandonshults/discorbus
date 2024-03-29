const Discord = require('discord.js');
const parseInput = require('./parse-input');
const { isWhiteListed, isBotMessage } = require('../utils/bag-o-fun');
const commands = require('../commands');
const scheduleChestWarnings = require('../chest-timer/schedule-chest-warnings');
const { MS_IN_A_MINUTE } = require('../chest-timer/next-chest-time');

const { INVALID_COMMAND, WRONG_ARGUMENTS, INVALID_RESPONSE } = require('./constants');
const { commandKey } = require('./config');

const authToken = process.env.AUTH_TOKEN;

const client = new Discord.Client();

client.login(authToken).catch(err => {
  console.log(err);
  process.exit(1);
});

client.on('ready', () => {
  console.log('Logged in');
  scheduleChestWarnings(client);
  keepAlive(0);
});

client.on('message', message => {
  if (!isWhiteListed(message) || isBotMessage(message)) {
    return;
  }

  const content = message.content;
  const { command, args } = parseInput(content);

  if (command !== INVALID_COMMAND) {
    const commandInfo = commands[command];
    commandInfo.fn(args, message)
      .then(results => {
        if (results === WRONG_ARGUMENTS) {
          message.channel.send(`Usage: ${commandInfo.usage}`);
        } else if (results === INVALID_RESPONSE) {
          message.channel.send('The Orbus public API failed to provide a recognized response.  Sorry.');
        }
      })
      .catch(err => {
        console.log(err);
        message.channel.send('Oops.  Something went wrong.');
      });
  } else if (content[0] === commandKey) {
    message.channel.send('Unknown command.');
  }
});

function keepAlive (param) {
  const test = param + 0;
  setTimeout(() => keepAlive(test), MS_IN_A_MINUTE * 0.99);
}

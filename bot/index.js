const Discord = require('discord.js');
const parseInput = require('./parse-input');
const { isWhiteListed, isBotMessage } = require('../utils/bag-o-fun');
const commands = require('../commands');

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
      .catch(() => message.channel.send('Oops.  Something went wrong.'));
  } else if (content[0] === commandKey) {
    message.channel.send('Unknown command.');
  }
});

const Discord = require('discord.js');
const commands = require('./load-commands');

const { INVALID_COMMAND, WRONG_ARGUMENTS } = require('./constants');
const { commandKey, whiteList } = require('./config');

const authToken = process.env.AUTH_TOKEN;
const environment = process.env.NODE_ENV;

const client = new Discord.Client();


client.login(authToken);

client.on('ready', () => {
  console.log('Logged in');
});

client.on('message', message => {
  const content = message.content;

  if (!isWhitelisted(message)) {
    return;
  }

  const { command, args } = parseInput(content);
  if(command !== INVALID_COMMAND) {
    const commandInfo = commands[command];
    commandInfo.fn(args, message)
      .then(results => {
        if(results === INVALID_COMMAND || results === WRONG_ARGUMENTS) {
          message.channel.send(`Usage: ${commandInfo.usage}`);
        }
      })
      .catch(() => message.channel.send('Oops.  Something went wrong.'));
  } else if(content[0] === commandKey) {
    message.channel.send('Unknown command.');
  }
});

function sendUsageResponse(commandInfo) {
  message.channel.send(`Usage: ${commandInfo.usage}`)
}

function parseInput(input) {
  const commandRegexp = new RegExp(`[${commandKey}](${Object.keys(commands).join('|')})(\\s.*)?$`);
  const parsedInput = commandRegexp.exec(input);

  if(isValidInput(parsedInput)) {
    return {
      command: parsedInput[1],
      args: parsedInput[2] !== undefined ? parsedInput[2].trim().split(' ') : undefined
    }
  } else {
    return {
      command: INVALID_COMMAND,
      args: WRONG_ARGUMENTS
    }
  }
}

function isWhitelisted(message) {
  const validRoleIds = whiteList.roles.map(role => role.id);
  return environment !== "production" || message.member._roles.filter(role => validRoleIds.indexOf(role) !== -1).length > 0;
}

function isValidInput(command) {
  return command && Object.keys(commands).indexOf(command[1]) > -1;
}

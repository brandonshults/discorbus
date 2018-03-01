const { commandKey } = require('./config');
const { INVALID_COMMAND, WRONG_ARGUMENTS } = require('./constants');
const commands = require('../commands');

const isValidInput = command => command && Object.keys(commands).indexOf(command[1]) > -1;

module.exports = function parseInput(input) {
  const commandRegexp = new RegExp(`[${commandKey}](${Object.keys(commands).join('|')})(\\s.*)?$`);
  const parsedInput = commandRegexp.exec(input);

  if(isValidInput(parsedInput)) {
    return {
      command: parsedInput[1],
      args: parsedInput[2] !== undefined ? parsedInput[2].trim().split(' ') : []
    }
  } else {
    return {
      command: INVALID_COMMAND,
      args: WRONG_ARGUMENTS
    }
  }
};
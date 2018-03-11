const { commandKey } = require('../bot/config');
const { WRONG_ARGUMENTS } = require('../bot/constants');
const spellcasting = require('../spellcasting/spellcasting.json');

const knownMages = Object.keys(Object.values(spellcasting).reduce((mages, spell) => {
  return Object.assign({}, mages, Object.keys(spell).reduce((magesForSpell, mage) => {
    return Object.assign({}, magesForSpell, {[mage]: true});
  }, {}));
}, {}));

const knownSpells = Object.keys(spellcasting);

module.exports = Object.freeze({
  usage: `${commandKey}spellcasting (spell) or ${commandKey}spellcasting (mage) (spell)
**Known spells**: ${knownSpells.join(', ')}
**Known mages**: ${knownMages.join(', ')}`,
  fn: function (commandArgs, message) {
    // A hacky way to lock this command down to a couple of channels.
    if (message.channel.name !== 'runemage' && message.channel.name !== 'events_control' && message.channel.name !== 'testing') {
      return Promise.resolve();
    }

    if (commandArgs.length === 0) {
      return Promise.resolve(WRONG_ARGUMENTS);
    }

    let spell = commandArgs.join(' ');
    let mage;
    if (knownMages.includes(commandArgs[0])) {
      mage = commandArgs[0];
      spell = commandArgs.slice(1).join(' ');
    }

    let gifs = [];

    if (mage && spell in spellcasting) {
      gifs.push(spellcasting[spell][mage]);
    } else if (spell in spellcasting) {
      gifs = gifs.concat(Object.values(spellcasting[spell]));
    }

    if (gifs.length > 0) {
      return message.channel.send(gifs.join('\n'));
    } else {
      return Promise.resolve(WRONG_ARGUMENTS);
    }
  }
});

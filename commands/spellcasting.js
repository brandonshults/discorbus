const shuffle = require('lodash.shuffle');
const { commandKey } = require('../bot/config');
const { WRONG_ARGUMENTS } = require('../bot/constants');
const spellcasting = require('../spellcasting/spellcasting.json');

const knownMages = Object.keys(Object.values(spellcasting).reduce((mages, spell) => {
  return Object.assign({}, mages, Object.keys(spell).reduce((magesForSpell, mage) => {
    return Object.assign({}, magesForSpell, {[mage]: true});
  }, {}));
}, {})).sort();

const knownSpells = Object.keys(spellcasting).sort();

module.exports = Object.freeze({
  usage: `${commandKey}spellcasting (spell), ${commandKey}spellcasting (mage), or ${commandKey}spellcasting (mage) (spell)
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

    let spells = [];

    if (mage && spell in spellcasting) {
      spells.push({ mage, spell: spellcasting[spell][mage] });
    } else if (mage) {
      spells = Object.keys(spellcasting)
        .map(spell => ({ mage, spell: (mage in spellcasting[spell] ? spell : null) }))
        .filter(({ spell }) => spell !== null);
    } else if (spell in spellcasting) {
      spells = Object.keys(spellcasting[spell]).map(mage => ({ mage, spell }));
    }

    if (spells.length > 0) {
      let isPruned = false;
      if (spells.length > 3) {
        spells = shuffle(spells).slice(0, 3);
        isPruned = true;
      }

      return message.channel.send(spells.map(({ spell, mage }) => `${mage} ${spell}:\n${spellcasting[spell][mage]}`).join('\n\n'))
        .then(() => isPruned ? message.channel.send('Results randomized and limited to 3.') : Promise.resolve());
    } else {
      return Promise.resolve(WRONG_ARGUMENTS);
    }
  }
});

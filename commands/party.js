const { INVALID_COMMAND, WRONG_ARGUMENTS } = require('../bot/constants');

const parties = new Map();
const participants = new Map();
const roles = new Map();
const trackedRoles = ['W', 'R', 'RM', 'M'];

function Party () {
  this.leader = null;          // tag
  this.leaderID = null;        // Discord numeric identifier
  this.members = new Map();    // tag to role
  this.activity = '';          // description of reason for group
  this.needs = '';
  this.maxSize = 5;
  this.full = () => this.members.size === this.maxSize;
}

function Participant () {
  this.name = null;            // username / nickname
  this.tag = null;             // tag
  this.role = null;            // W (Warrior) | M (Musketeer) | R (Ranger) | RM (Rune Mage)
  this.currentParty = null;    // Party() reference
}

function getParticipantByTag (memberTag) {
  let participant;
  if (!participants.get(memberTag)) {
    participant = new Participant();
    participant.tag = memberTag;
    participant.name = userFromTag(memberTag);
    participants.set(memberTag, participant);
  } else {
    participant = participants.get(memberTag);
  }
  return participant;
}

function getRole (memberTag) {
  return participants.get(memberTag) ? participants.get(memberTag).role : undefined;
}

function setRole (memberTag, role, updateParty = true) {
  if (!trackedRoles.includes(role)) return WRONG_ARGUMENTS;
  const participant = getParticipantByTag(memberTag);
  participant.role = role;
  participants.set(memberTag, participant);
  if (updateParty && participant.currentParty) return setPartyRole(participant.currentParty, memberTag, role);
}

function getPartyRole (leaderTagOrPartyRef, memberTag) {
  const partyRef = leaderTagOrPartyRef instanceof Party ? leaderTagOrPartyRef : parties.get(leaderTagOrPartyRef);
  if (!partyRef) return Promise.resolve(WRONG_ARGUMENTS);
  return partyRef.members.get(memberTag);
}

function setPartyRole (leaderTagOrPartyRef, memberTag, role) {
  let partyRef = leaderTagOrPartyRef instanceof Party ? leaderTagOrPartyRef : parties.get(leaderTagOrPartyRef);
  if (!partyRef) return WRONG_ARGUMENTS;
  partyRef.members.set(memberTag, role);
  let participant = getParticipantByTag(memberTag);
  participant.currentParty = partyRef;
}

function userFromTag (tag) {
  return tag.split('#')[0];
}

function isMention (inString) {
  return inString && inString.trim().match(/<@[0-9]*>/);
}

function numberFromMention (inString) {
  return inString.replace(/<@([0-9]*)>/, '$1');
}

module.exports = {
  usage: 'For help, type **!party help**',
  name: 'party',
  fn: (args, msg) => {
    let action;
    if (!args || args.length === 0) {
      action = 'help';
    } else {
      action = args[0];
    }
    const params = args.slice(1);

    switch (action) {
      case 'debug':
        console.dir(msg.author.id);
        break;
      case 'help': {
        return msg.channel.send('```Party command help:\n' +
          '!party list - returns a list of all currently running parties.\n' +
          '!party all - alias for !party list\n' +
          "!party start [activity] - start a new party listing with yourself as the listing 'leader'.\n" +
          '             [activity] is an optional description of what you plan to do. :)\n' +
          '!party disband - delete your party listing.\n' +
          '!party add @mention - adds the mentioned person to your party listing.\n' +
          '!party kick @mention - kicks the mentioned person from your party listing. (Party leader only)\n' +
          "!party set activity - Sets/Changes the description of your group's activity (Party leader only)\n" +
          "!party set need - Sets/Changes the need label for your party. (Party leader only. Ex: 'dps and healer')\n" +
          '!party set role [W|R|M|RM] - Sets your role to Warrior, Ranger, Musketeer or Runemage respectively.\n' +
          "!party set role @mention [W|R|M|RM] - Sets @mentioned user's role.\n" +
          '!party join @mention - Join the party being led by @mentioned user.\n' +
          '!party leave - Leave your current party.\n' +
          '```');
      }
      case 'list': // List all available groups
      case 'all': {
        let output = '```<<<Parties>>>\n';
        if (parties.size === 0) {
          output += 'No current parties. To start a party, type **!party start**';
        }
        for (let keyValPair of parties) {
          const leaderTag = keyValPair[0];
          let party = keyValPair[1];
          output += `Activity: ${party.activity} \n`;
          output += `Leader: ${userFromTag(leaderTag)} \n`;
          const memberCount = party.members.size;
          output += `${memberCount} Members: ${party.full() ? '(Full)' : ''}`;
          for (let member of party.members) {
            const memberName = userFromTag(member[0]);
            let memberRole = getPartyRole(party, member[0]) || '??';
            if (memberRole === WRONG_ARGUMENTS) return Promise.resolve(WRONG_ARGUMENTS);
            output += `${memberName}(${memberRole}), `;
          }
          output = output.slice(0, output.length - 2); // Remove final trailing comma (always at least one member == Leader)
          output += `\nNeed: ${party.needs}`;
        }
        output += '```';
        return msg.channel.send(output);
      }
      case 'start': { // Start a group with the message author as the leader.
        if (parties.get(msg.author.tag)) {
          msg.reply('You already have a party started. You must disband your party first. To disband, use **!party disband**');
          return Promise.resolve(INVALID_COMMAND);
        }

        let party = new Party();
        party.leader = msg.author.tag;
        party.leaderID = msg.author.id;
        // party.members.set(msg.author.tag);

        if (!getRole(msg.author.tag)) {
          msg.reply('Please set your default role first. (**!party set role [W|M|R|RM]**)');
          return Promise.resolve(INVALID_COMMAND);
        }

        setPartyRole(party, msg.author.tag, getRole(msg.author.tag));

        if (params.length !== 0) {
          let activityText = [...params];
          party.activity = activityText.length > 0 ? activityText.join(' ') : null;
        }

        parties.set(msg.author.tag, party);

        return msg.reply('Created group.');
      }
      case 'disband': {
        if (!parties.get(msg.author.tag)) {
          msg.reply('You do not currently have a party.');
          return Promise.resolve(INVALID_COMMAND);
        } else {
          parties.delete(msg.author.tag);
          return msg.reply('Your party has been disbanded. You are free to start another party at any time.');
        }
      }
      case 'set': { // Leader: activity, need, start, end, full / Any: role, availability
        if (params.length === 0) return Promise.resolve(WRONG_ARGUMENTS);
        const setKey = params[0];
        switch (setKey) {
          case 'role' : {
            if (!params[1]) return Promise.resolve(WRONG_ARGUMENTS);

            let memberTag;
            let roleParam;

            if (isMention(params[1])) {
              if (!params[2]) return Promise.resolve(WRONG_ARGUMENTS);
              memberTag = msg.guild.members.get(numberFromMention(params[1])).user.tag;
              roleParam = params[2].toUpperCase();
            } else {
              memberTag = msg.author.tag;
              roleParam = params[1].toUpperCase();
            }

            if (!roleParam || !trackedRoles.includes(roleParam)) {
              msg.reply('sorry, ' + roleParam + ' is not a valid role. Please use W, R, M or RM.');
              return Promise.resolve(WRONG_ARGUMENTS);
            }

            let result = setRole(memberTag, roleParam);
            if ([WRONG_ARGUMENTS, INVALID_COMMAND].includes(result)) {
              return Promise.resolve(result);
            } else {
              const username = msg.mentions.users.first() ? msg.mentions.users.first().username : msg.author.username;
              return msg.channel.send(username + "'s role has been set to " + roleParam);
            }
          }
          case 'need': {
            let party = parties.get(msg.author.tag);
            if (!party) return Promise.resolve(INVALID_COMMAND);
            let needs = [...params];
            needs.shift();
            party.needs = needs.length > 0 ? needs.join(' ') : null;
            break;
          }
          case 'activity': {
            let party = parties.get(msg.author.tag);
            if (!party) return Promise.resolve(INVALID_COMMAND);
            let activityText = [...params];
            activityText.shift();
            party.activity = activityText.length > 0 ? activityText.join(' ') : null;
            break;
          }
          default:
            return Promise.resolve(WRONG_ARGUMENTS);
        }
        console.dir(params);
        break;
      }
      case 'add': { // Leader may add another server member to their team by tag
        if (params.length === 0) return Promise.resolve(WRONG_ARGUMENTS);

        if (isMention(params[0])) {
          const memberNum = numberFromMention(params[0]);

          if (parties.get(msg.author.tag)) {
            const memberInfo = msg.guild.members.get(memberNum).user;
            const memberTag = memberInfo.username + '#' + memberInfo.discriminator;
            const result = setPartyRole(msg.author.tag, memberTag, roles.get(memberTag));
            if (result === WRONG_ARGUMENTS) {
              console.error('Wrong arguments.');
              return Promise.resolve(WRONG_ARGUMENTS);
            } else {
              console.dir(parties.get(msg.author.tag));
            }
          } else {
            console.error("Couldn't find party.");
          }
        } else {
          return Promise.resolve(WRONG_ARGUMENTS);
        }
        break;
      }
      case 'kick': {
        if (params.length === 0) {
          msg.reply('Invalid parameters.');
          return Promise.resolve(INVALID_COMMAND);
        }
        const mentionedUser = msg.mentions.users.first();
        if (!isMention(params[0])) {
          msg.reply('Please use the format **!party kick @mention** where @mention is the tag for the user you want to remove from your party listing.');
          return Promise.resolve(WRONG_ARGUMENTS);
        } else if (!getParticipantByTag(msg.author.tag).currentParty || getParticipantByTag(msg.author.tag).currentParty.leader !== msg.author.tag) {
          msg.reply('You are not currently leading a party.');
          return Promise.resolve(INVALID_COMMAND);
        } else if (msg.author.tag === mentionedUser.tag) {
          msg.reply("You can't leave your own party. To disband use ***!party disband***");
          return Promise.resolve(INVALID_COMMAND);
        }

        const firstMention = mentionedUser;
        if (firstMention.id === numberFromMention(params[0])) { // Probably super-redundant, but makes me feel comfortable.
          const participant = getParticipantByTag(firstMention.tag);
          const leader = getParticipantByTag(msg.author.tag);
          if (participant.currentParty !== leader.currentParty) {
            msg.reply('You can only kick people who are in your party.');
            return Promise.resolve(INVALID_COMMAND);
          }
          participant.currentParty.members.delete(firstMention.tag);
          participant.currentParty = null;
          return msg.channel.send('`' + firstMention.tag + ' has been removed from the party.`');
        } else {
          msg.reply('Invalid parameters.');
          return Promise.resolve(INVALID_COMMAND);
        }
      }
      case 'join': { // Join a group by @mentioning group leader
        if (!isMention(params[0])) {
          msg.reply('Please use the format **!party join @mention** where @mention is the tag for the party leader.');
          return Promise.resolve(WRONG_ARGUMENTS);
        }
        let party = Array.from(parties.values()).find(p => p.leaderID === numberFromMention(params[0]));
        if (!party) {
          msg.reply('That member does not currently have a party.');
          return Promise.resolve(INVALID_COMMAND);
        } else {
          console.dir(party);
        }
        if (party.full()) {
          msg.reply('Sorry, but the party is already full.');
          return Promise.resolve(INVALID_COMMAND);
        }
        return setPartyRole(party, msg.author.tag, getRole(msg.author.tag));
      }
      case 'leave': {
        const participant = getParticipantByTag(msg.author.tag);
        const leader = getParticipantByTag(participant.currentParty.leader);
        if (leader === participant) {
          msg.reply("You can't leave your own party. To disband use ***!party disband***");
          return Promise.resolve(INVALID_COMMAND);
        }
        participant.currentParty.members.delete(msg.author.tag);
        participant.currentParty = null;
        break;
      }
      case 'info': // Get info about a group by @mentioning group leader
        break;
      default:
        msg.reply("I don't know that command.");
        return Promise.resolve(INVALID_COMMAND);
    }
  }
};

import BullshitStorage from './bullshitter/storage/bullshit-storage';
import SuggestionStorage from './bullshitter/storage/suggestions';
import { bind } from './utils';

/**
 * Extracts command's name from text
 *
 */
const getCommandName = text => {
  const commandNamePatternMatch = text.match(/^\s*(\/\w+)\s*/i);
  return commandNamePatternMatch && commandNamePatternMatch[1];
};

const extractURLFromSuggestion = text => {
  const matches =  text.match(/^\/suggest\s+((?:http:\/\/|https:\/\/|www\.)\S+)/i);
  const url = matches && matches[1];
  return url || null;
};

const describeUser = user => {
  const name = [].concat((user.first_name && [user.first_name]), (user.last_name && [user.last_name])).join(' ');
  const result = name + (user.username && [' (@', user.username, ')'].join('') || '');
  return result;
};


class CommandProcessor {
  constructor(bot) {
    this.bot = bot;

    bind([
      'getReactionMap',
      'getReactionToCommand',
      'suggest',
      'listSuggestions',
      'commandIsPermitted',
      'cleanupBase'
    ]).to(this);

  }

  getReactionToCommand (msg) {
    const commandName = getCommandName(msg.text);
    const knownCommand = this.getReactionMap()[commandName];
    let result;
    if (knownCommand) {
      result = this.commandIsPermitted(commandName, msg.from.id) && knownCommand || null;
    }

    return result;
  }


// TODO: cache permissions for users
  commandIsPermitted (commandName, userId) {
    const requiredPermissions = this.bot.settings.protectedCommands[commandName];
    let permissionGranted = !requiredPermissions;

    if (requiredPermissions) {
      permissionGranted = requiredPermissions.reduce((result, permissionType) => {
        return result && this.bot.settings.permissions[permissionType].indexOf(userId) !== -1;
      }, true);
    }

    return permissionGranted;
  }

  addPhrase (msg) {
    const textToBeSaved = msg.text.replace('/add', '').trim();
    if (textToBeSaved) {
      BullshitStorage.saveBullshit(textToBeSaved, true);
    }
  }

  showStats() {
    const origins = BullshitStorage.findBullshits({origin: true});
    const bullshits = BullshitStorage.findBullshits({origin: false});
    const message = 'DB now contains: \n' +
      `${origins.length} source phrases \n` +
      `${bullshits.length} generated phrases \n` +
      `${(origins.length + bullshits.length)} total.`;
    return message;
  }

  cleanupBase() {
    const bullshitsAmount = BullshitStorage.findBullshits({origin: false}).length;
    BullshitStorage.cleanup();
    return `${bullshitsAmount} pieces of bullshit removed from DB. \n\n ${this.showStats()}`;
  }

  suggest(msg) {
    const url = extractURLFromSuggestion(msg.text);
    const result = SuggestionStorage.addSuggestion({
      url,
      user: msg.from
    });
    return this.bot.settings.messages.suggestions[result];
  }

  describeSuggestion(existingText, item) {
    const { url, user } = item;
    return `${existingText} ${url}, from ${describeUser(user)} \n`;
  }

  listSuggestions () {
    const suggestions = SuggestionStorage.getSuggestions();
    return suggestions.reduce(this.describeSuggestion, '') || 'No suggestions yet';
  }

  getReactionMap () {
    return {
      '/add': this.addPhrase,
      '/stats': this.showStats,
      '/heal': this.cleanupBase,
      '/suggest': this.suggest,
      '/suggestions': this.listSuggestions,
      '/help': this.bot.settings.messages.hello,
      '/start': this.bot.settings.messages.hello
    };
  }
}

export default CommandProcessor;

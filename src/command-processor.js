var BullshitStorage = require('./bullshitter/storage/bullshit-storage.js'),
    SuggestionStorage = require('./bullshitter/storage/suggestions.js');

function CommandProcessor (bot) {
  this.bot = bot;
}

/**
 * Extracts command's name from text
 *
*/
function getCommandName(text) {
  var commandNamePatternMatch = text.match(/^\s*(\/\w+)\s*/i),
      commandName = commandNamePatternMatch && commandNamePatternMatch[1];
  return commandName;
}

CommandProcessor.prototype.getReactionToCommand = function (msg) {
  var self = this,
      commandName = getCommandName(msg.text),
      knownCommand = this.getReactionMap()[commandName],
      result;
  if (knownCommand) {
    result = self.commandIsPermitted(commandName, msg.from.id) && knownCommand || null;
  }

  return result;
};


// TODO: cache permissions for users
CommandProcessor.prototype.commandIsPermitted = function (commandName, userId) {
  var self = this,
      requiredPermissions = self.bot.settings.protectedCommands[commandName],
      permissionGranted = !requiredPermissions;

  if (requiredPermissions) {
    permissionGranted = requiredPermissions.reduce(function(result, permissionType) {
      return result && self.bot.settings.permissions[permissionType].indexOf(userId) !== -1;
    }, true);
  }

  return permissionGranted;
};

CommandProcessor.prototype.addPhrase = function (msg) {
  var textToBeSaved = msg.text.replace('/add', '').trim();
  if (textToBeSaved) {
    BullshitStorage.saveBullshit(textToBeSaved, true);
  }
};

CommandProcessor.prototype.showStats = function () {
  var origins = BullshitStorage.findBullshits({origin: true}),
      bullshits = BullshitStorage.findBullshits({origin: false}),
      message = 'DB now contains: \n' +
        origins.length + ' source phrases \n' +
        bullshits.length + ' generated phrases \n' +
        (origins.length + bullshits.length) + ' total.';
  return message;
};

CommandProcessor.prototype.cleanupBase = function () {
  var bullshitsAmount = BullshitStorage.findBullshits({origin: false}).length;
  BullshitStorage.cleanup();
  return bullshitsAmount + ' pieces of bullshit removed from DB. \n\n' + this.showStats();
};


CommandProcessor.prototype.suggest = function (msg) {
  var url = extractURLFromSuggestion(msg.text),
      result = SuggestionStorage.addSuggestion({
        url: url,
        user: msg.from
      });
  return this.bot.settings.messages.suggestions[result];
};

function extractURLFromSuggestion(text) {
  var matches =  text.match(/^\/suggest\s+((?:http:\/\/|https:\/\/|www\.)\S+)/i),
      url = matches && matches[1];
  return url || null;
}

CommandProcessor.prototype.listSuggestions = function () {
  return SuggestionStorage
      .getSuggestions()
      .reduce(function (sum, item) {
        return sum + item.url + ', from ' + describeUser(item.user) + '\n';
      }, '') || 'No suggestions yet';
};

function describeUser(user) {
  var name = [].concat((user.first_name && [user.first_name]), (user.last_name && [user.last_name])).join(' '),
      result = name + (user.username && [' (@', user.username, ')'].join('') || '');
  return result;
}

CommandProcessor.prototype.getReactionMap = function () {
  var self = this;
  return {
    '/add': self.addPhrase,
    '/stats': self.showStats,
    '/heal': self.cleanupBase.bind(self),
    '/suggest': self.suggest.bind(self),
    '/suggestions': self.listSuggestions.bind(self),
    '/help': self.bot.settings.messages.hello,
    '/start': self.bot.settings.messages.hello
  };
};


module.exports = CommandProcessor;
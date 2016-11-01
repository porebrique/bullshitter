var BullshitStorage = require('./bullshitter/bullshit-storage.js');

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

CommandProcessor.prototype.getReactionToUnsupportedCommand = function (msg) {
  return this.bot.settings.messages.unknownCommand.replace('%command%',getCommandName(msg.text));
};

CommandProcessor.prototype.getReactionToCommand = function (msg) {
  var self = this,
      commandName = getCommandName(msg.text),
      knownCommand = this.getReactionMap()[commandName],
      result;
  if (knownCommand) {
    result = self.commandIsPermitted(commandName, msg.from.id) && knownCommand || null;
  } else {
    result = self.getReactionToUnsupportedCommand(msg)
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

// TODO: permissions
CommandProcessor.prototype.showStats = function (msg) {
  var origins = BullshitStorage.findBullshits({origin: true}),
      bullshits = BullshitStorage.findBullshits({origin: false}),
      message = 'DB now contains: \n' +
        origins.length + ' source phrases \n' +
        bullshits.length + ' generated phrases \n' +
        (origins.length + bullshits.length) + ' total.';
  return message;
};

CommandProcessor.prototype.getReactionMap = function () {
  var self = this;
  return {
    '/add': self.addPhrase,
    '/stats': self.showStats,
    '/start': self.bot.settings.messages.hello
  };
};


module.exports = CommandProcessor;
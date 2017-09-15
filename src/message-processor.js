
var CommandProcessor = require('./command-processor'),
    bullshitter = require('./bullshitter/index.js'),
    settings = require('../settings.js');

function MessageProcessor (bot) {
  this.bot = bot;
  this.bot.settings = settings;
  this.commandProcessor = new CommandProcessor(bot);
}

MessageProcessor.prototype.sendMessage = function (aChatId, aMessage) {
  this.bot.sendMessage(aChatId, aMessage);
};


MessageProcessor.prototype.processMessage = function (msg) {
  var self = this;

  if (msg.text.startsWith('/')) {
    self.processCommand(msg);
  } else {
    self.processGeneralMessage(msg);
  }

};

// TODO consider avoiding ifs inside swtich.
// Maybe commandProcessor should perform action itself and return only result?
MessageProcessor.prototype.processCommand = function (msg) {
  var self = this,
      reactionToCommand =  self.commandProcessor.getReactionToCommand(msg);

  switch (typeof reactionToCommand) {
    case 'function':
      var reactionResult = reactionToCommand(msg);
      if (typeof reactionResult === 'string') {
        self.sendMessage(msg.chat.id, reactionResult);
      }
      break;
    case 'string':
      self.sendMessage(msg.chat.id, reactionToCommand);
      break;
    default:
      //console.log('No reaction, seems like command is restricted');
      break;
  }
};

/**
 * Returns regexp matching any of bot's names followed by space, or comma, or end of string.
 * Regexp is generated only once, then kept cached in this.bot.botMentionsRegexp
 * @returns {RegExp}
 */
MessageProcessor.prototype.getBotMentionRegexp = function () {
  var result = this.bot.botMentionsRegexp;
  if (!this.bot.botMentionsRegexp) {
    var namesJoined = this.bot.settings.names.reduce(function(last, next){
        return '(' + last + ')' + '|(' + next + ')';
      });

    this.bot.botMentionsRegexp = new RegExp('^(' + namesJoined + ')(\\s|,|$)', 'i');
  }
  return this.bot.botMentionsRegexp;
};

MessageProcessor.prototype.sayRandomShit = function (msg) {
  var self = this,
      permissionToSave = self.bot.settings.permissions.write.indexOf(msg.from.id) !== -1,
      result = bullshitter.getBullshit(self.removeBotMentions(msg.text));
  return result || null;
};

MessageProcessor.prototype.removeBotMentions = function (messageText) {
  return messageText.replace(this.getBotMentionRegexp(), '').trim();
};

// TODO: somehow combine with removeBotMentions for avoiding second iteration
MessageProcessor.prototype.isSaidToBot = function(messageText) {
  var lowercasedMessage = messageText.toLowerCase(),
      messageIsForBot = false;

  this.bot.settings.names.map(function(botName) {
    if (lowercasedMessage.indexOf(botName.toLocaleLowerCase()) === 0) {
      messageIsForBot = true;
    }
  });
 return messageIsForBot;
};

MessageProcessor.prototype.isTimeToSayRandomly = function () {
  var chance = settings.randomPhraseChance || 0;
  var random = Math.floor(Math.random() * 100);
  return chance > random;
};

MessageProcessor.prototype.processGeneralMessage = function (msg) {
  var self = this,
      isSaidToBot = self.isSaidToBot(msg.text),
      isTimeToSayRandomly = self.isTimeToSayRandomly(),
      resultMessage = (isSaidToBot || isTimeToSayRandomly ) && self.sayRandomShit(msg);

  if (resultMessage) {
    self.sendMessage(msg.chat.id, resultMessage);
  }

};

module.exports = MessageProcessor;
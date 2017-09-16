import CommandProcessor from './command-processor';
import bullshitter from './bullshitter';
import settings from '../settings';
import { bind } from './utils';

export default class MessageProcessor {

  constructor(bot) {
    this.bot = bot;
    this.bot.settings = settings;
    this.commandProcessor = new CommandProcessor(bot);

    bind([
      'processMessage',
      'processCommand',
      'sayRandomShit',
      'processGeneralMessage'
    ]).to(this);
  }

  sendMessage (aChatId, aMessage) {
    this.bot.sendMessage(aChatId, aMessage);
  }

  processMessage (msg) {
    if (msg.text.startsWith('/')) {
      this.processCommand(msg);
    } else {
      this.processGeneralMessage(msg);
    }
  }


  // TODO consider avoiding ifs inside swtich.
  // Maybe commandProcessor should perform action itself and return only result?
  processCommand (msg) {
    const reactionToCommand = this.commandProcessor.getReactionToCommand(msg);

    switch (typeof reactionToCommand) {
      case 'function':
        const reactionResult = reactionToCommand(msg);
        if (typeof reactionResult === 'string') {
          this.sendMessage(msg.chat.id, reactionResult);
        }
        break;
      case 'string':
        this.sendMessage(msg.chat.id, reactionToCommand);
        break;
      default:
        //console.log('No reaction, seems like command is restricted');
        break;
    }
  }

  /**
   * Returns regexp matching any of bot's names followed by space, or comma, or end of string.
   * Regexp is generated only once, then kept cached in this.bot.botMentionsRegexp
   * @returns {RegExp}
   */
  getBotMentionRegexp () {
    const result = this.bot.botMentionsRegexp;
    if (!this.bot.botMentionsRegexp) {
      const namesJoined = this.bot.settings.names.reduce((last, next) => {
        return '(' + last + ')' + '|(' + next + ')';
      });

      this.bot.botMentionsRegexp = new RegExp('^(' + namesJoined + ')(\\s|,|$)', 'i');
    }
    return this.bot.botMentionsRegexp;
  }

  sayRandomShit (msg) {
    const result = bullshitter.getBullshit(this.removeBotMentions(msg.text));
    return result || null;
  }

  removeBotMentions (messageText) {
    return messageText.replace(this.getBotMentionRegexp(), '').trim();
  }

// TODO: somehow combine with removeBotMentions for avoiding second iteration
  isSaidToBot (messageText) {
    const lowercasedMessage = messageText.toLowerCase();
    let messageIsForBot = false;

    this.bot.settings.names.map(botName => {
      if (lowercasedMessage.indexOf(botName.toLocaleLowerCase()) === 0) {
        messageIsForBot = true;
      }
    });
    return messageIsForBot;
  }

  isTimeToSayRandomly () {
    const chance = settings.randomPhraseChance || 0;
    const random = Math.floor(Math.random() * 100);
    return chance > random;
  }

  processGeneralMessage (msg) {
    const isSaidToBot = this.isSaidToBot(msg.text);
    const isTimeToSayRandomly = this.isTimeToSayRandomly();
    const resultMessage = (isSaidToBot || isTimeToSayRandomly ) && this.sayRandomShit(msg);

    if (resultMessage) {
      this.sendMessage(msg.chat.id, resultMessage);
    }
  }
}

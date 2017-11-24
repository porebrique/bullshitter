import CommandProcessor from './command-processor';
import bullshitter from './bullshitter';
import settings from '../settings';
import { bind } from './utils';

export default class MessageProcessor {

  static isTimeToSayRandomly () {
    const chance = settings.randomPhraseChance || 0;
    const random = Math.floor(Math.random() * 100);
    return chance > random;
  }

  /**
   * Returns regexp matching any of bot's names followed by space, or comma, or end of string.
   * @returns {RegExp}
   */
  static getBotMentionRegexp () {
    const namesJoined = settings.names.map(name => `(${name})`).join('|');
    return new RegExp(`^(${namesJoined})(\\s|,|$)`, 'i');
  }

  constructor(bot) {
    this.bot = bot;
    this.bot.settings = settings;
    this.commandProcessor = new CommandProcessor(bot);
    // Every message is being checked if it is said to bot.
    // To avoid constant re-calculating, lets generate and store required regexp once.
    this.bot.botMentionsRegexp = this.constructor.getBotMentionRegexp();

    bind([
      'processMessage',
      'processCommand',
      'sayRandomShit',
      'processGeneralMessage'
    ]).to(this);
  }

  getBullshit(text) {
    return bullshitter.getBullshit(text);
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

  sayRandomShit (msg) {
    const result = this.getBullshit(this.removeBotMentions(msg.text));
    return result || null;
  }

  removeBotMentions (messageText) {
    const { botMentionsRegexp } = this.bot;
    return messageText.replace(botMentionsRegexp, '').trim();
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

  processGeneralMessage (msg) {
    const isSaidToBot = this.isSaidToBot(msg.text);
    const isTimeToSayRandomly = this.constructor.isTimeToSayRandomly();
    const isReplyRequired = isSaidToBot || isTimeToSayRandomly;

    if (isReplyRequired) {
      const resultMessage = this.sayRandomShit(msg);
      this.sendMessage(msg.chat.id, resultMessage);
    }
  }
}

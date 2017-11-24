import CommandProcessor from './command-processor';
import bullshitter from './bullshitter';
import settings from '../settings';
import { bind } from './utils';
import Message from './message';

export default class MessageProcessor {

  static isTimeToSayRandomly () {
    const chance = settings.randomPhraseChance || 0;
    const random = Math.floor(Math.random() * 100);
    return chance > random;
  }

  constructor(bot) {
    this.bot = bot;
    this.bot.settings = settings;
    this.commandProcessor = new CommandProcessor(bot);

    bind([
      'getMessage',
      'processMessage',
      'processCommand',
      'processGeneralMessage'
    ]).to(this);
  }

  getBullshit(text) {
    return bullshitter.getBullshit(text);
  }

  getMessage(msg) {
    const messageOptions = [
      msg,
      { botNames: this.bot.settings.names }
    ];
    return new Message(...messageOptions);
  }

  sendMessage (aChatId, aMessage) {
    this.bot.sendMessage(aChatId, aMessage);
  }

  /**
   * Processes message as general message or as a command
   * @param {Object} msg message object received from API
   */
  processMessage (msg) {
    const message = this.getMessage(msg);
    const isCommand = message.isCommand();
    // TODO: replace msg with message but be cautious with nested methods
    if (isCommand) {
      this.processCommand(msg);
    } else {
      this.processGeneralMessage(message);
    }
  }


  // TODO consider avoiding ifs inside swtich.
  // Maybe commandProcessor should perform action itself and return only result?
  /**
   *
   * @param {Object} msg message object received from API
   */
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
   *
   * @param {Message} msg  instance of Message class
   */
  processGeneralMessage (msg) {
    const isSaidToBot = msg.isSaidToBot();
    const isTimeToSayRandomly = this.constructor.isTimeToSayRandomly();
    const isReplyRequired = isSaidToBot || isTimeToSayRandomly;

    if (isReplyRequired) {
      const resultMessage = this.getBullshit(msg.getText());
      this.sendMessage(msg.getChatId(), resultMessage);
    }
  }
}

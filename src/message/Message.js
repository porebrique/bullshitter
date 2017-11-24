import { bind } from '../utils';
import settings from '../../settings';
import * as lodash from 'lodash';

export default class {

  constructor(msg, options ) {
    const { botNames } = options;
    lodash.assign(this, msg, { options: { botNames } });

    bind([
      'isCommand',
      'isSaidToBot',
      'getBotMentionRegexp',
      'getText',
      'removeBotMentions',
    ]).to(this);
  }

  isCommand() {
    return this.text.startsWith('/');
  }

  // TODO: somehow combine with removeBotMentions for avoiding second iteration
  // TODO: this should not react on names being a part of some word. Maybe mention should START with bots name
  isSaidToBot () {
    const { text, options } = this;
    const lowercasedMessage = text.toLowerCase();
    const namesLowercase = options.botNames.map(name => name.toLocaleLowerCase());
    return lodash.some(namesLowercase, botName => lowercasedMessage.startsWith(botName));
  }

  getText() {
    return this.removeBotMentions();
  }

  getChatId() {
    return this.chat.id;
  }

  /**
   * Returns regexp matching any of bot's names followed by space, or comma, or end of string.
   * @returns {RegExp}
   */
  getBotMentionRegexp () {
    const namesJoined = this.options.botNames.map(name => `(${name})`).join('|');
    return new RegExp(`^(${namesJoined})(\\s|,|$)`, 'i');
  }

  removeBotMentions () {
    const { text } = this;
    const botMentionsRegexp = this.getBotMentionRegexp();
    return text.replace(botMentionsRegexp, '').trim();
  }

}

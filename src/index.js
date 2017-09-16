import MessageProcessor from './message-processor';
import TelegramBot from 'node-telegram-bot-api';
import settings from '../settings.js';

export default class {

  start() {
    const token = settings.token;
    const botOptions = {
      polling: true
    };

    const bot = new TelegramBot(token, botOptions);
    const messageProcessor = new MessageProcessor(bot);

    bot.getMe().then(this.welcome);
    bot.on('text', messageProcessor.processMessage);
  };

  welcome(me) {
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
  }
}

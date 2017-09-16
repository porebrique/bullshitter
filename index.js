import MessageProcessor from './src/message-processor';

var TelegramBot = require('node-telegram-bot-api'),
    settings = require('./settings.js'),
    token = settings.token,
    botOptions = {
      polling: true
    };

var bot = new TelegramBot(token, botOptions),
    messageProcessor = new MessageProcessor(bot);

bot.getMe().then(function (me) {
  console.log('Hello! My name is %s!', me.first_name);
  console.log('My id is %s.', me.id);
  console.log('And my username is @%s.', me.username);
});


bot.on('text', messageProcessor.processMessage.bind(messageProcessor));

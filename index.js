
var TelegramBot = require('node-telegram-bot-api'),
    MessageProcessor = require('./src/message-processor'),
    BullShitter = require('./src/bullshitter/index.js'),
    settings = require('./settings.js'),
    token = settings.token,
    botOptions = {
      polling: true
    };

var bot = new TelegramBot(token, botOptions),
    MessageProcessor = new MessageProcessor(bot);

bot.getMe().then(function (me) {
  console.log('Hello! My name is %s!', me.first_name);
  console.log('My id is %s.', me.id);
  console.log('And my username is @%s.', me.username);
});


bot.on('text', MessageProcessor.processMessage.bind(MessageProcessor));

// ---

//var express = require('express');
//var app = express();
//
//app.get('/ping_bot', function (request, res) {
//  //console.log('request is', request);
//  //MessageProcessor.sayToTester('test from node');
//  //res.send('Hello World!');
//
//  // TODO: remove responses
//  //var msg = 'семь раз отмерь -- один отрежь';
//  var msg = 'обманули дурака на четыре кулака';
//  res.send(BullShitter.getBullshit(msg))
//});
//
//app.listen(3001, function (request) {
//  console.log('Example app listening on port 3000!');
//});
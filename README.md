# bot
Some t-bot


It uses src/private/settings.js, which should content bot's settings with this structure:

 module.exports = {
   token: 'you_bot_token',
   names: ['some', "names", 'bot', 'should', 'react', 'to'],
   permissions: {
     write: [
       1234567890 // telegram's id of user
     ]
   },
   protectedCommands: {
     '/command': ['write']
   }
 };
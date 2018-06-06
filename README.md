# Bullshitter
## Telegram bot 


### What Bullshitter does
 It' easier to explain using an example.
 
 1. You say "Bot, do you like hamsters?"
 2. Bot understands that message is addressed to him.
 3. Bot randomly takes one of words, i.e. "hamsters"
 4. Bot searches his DB and finds two stored phrases with selected word, "Twenty hamsters drink laphroaig" and "Hamsters are evil monsters from hell".
 5. Bot combines those phrases to "Twenty hamsters are evil monsters from hell".
 6. Bot says whatever this bullshit and, if phrase passes validation, remembers it.
 
 Sure, this is incredibly stupid example, but hopefully you get the idea.

### How bullshitter works

Bot is a node.js application. You just configure it (see below), create db.json in root folder and run it with npm start.

### Supported commands

* **/add**: adds a phrase
* **/stats**: show what's in DB currently
* **/heal**: removes bot-generated phrases (but leaves added manually)
* **/suggest**: allows anyone to suggest an URL with something that can be added to bot's DB
* **/suggestions**: lists suggestions (and marks them as read)
* **/hello**: obvious.

### Settings file structure

Settings are supposed to be stored in **settings.js**, in a root folder.
It should look like this:
```javascript
module.exports = {
   token: 'your_bot_token', // (should look like '1743457345:hSdfhScjb349dSdffsdgsgsdgsdg' )
   names: ['some', "names", 'bot', 'should', 'react', 'to'],
   permissions: {
     write: [
       12345678900987654321 // telegram's id of user. ID, not a username. Yeah, it can be tricky to get it.
     ],
     read: []
   },
   // Chance of replying to a message not addressed to bot, in percents. Better keep it low, bot can be really annoying.
   randomPhraseChance: 1,
   stopWords: [
    // If bot generates a phrase including any of listed words more than max number of times,
    // it will be sayed, but not stored in DB, This may look useless, but believe me, it isn't.
    ['wordYouDontLike', 2]
   ],
   protectedCommands: {
   // You may want to protect some commands, making them not available for random users.
     '/stats': ['read'],
     '/add': ['write']
   },
 messages: {
    hello: 'message sended as a reply to /start',
    suggestions: {
      // Messages used to react on /suggest command in various cases
      saved: 'reaction to successfully saved suggestion',
      duplicate: 'reaction to a suggestion already existing is DB',
      long: 'suggestion is too long',
      wrong: 'wrong suggestion formst (basically, not a link)',
      full: 'when suggestions queue is too long'
    }
 }
};
```

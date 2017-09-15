# Bullshitter
## Telegram bot 


### What Bullshitter does
 It' easier to explain using an example.
 
 1. You say "Bot, do you like hamsters?"
 2. Bot understands that message is addressed to him.
 3. Bot searches his DB and finds to stored phrases, "Twenty hamsters drink laphroaig" and "Hamsters are evil monsters from hell".
 4. Bot combines those phrases to "Twenty hamsters are evil monsters from hell".
 
 Sure, this is incredibly stupid example, but hopefully you get the idea.

### How bullshitter works

Bot is a node.js application. You just configure it (see below), create fb.json in root folder and run it with npm start.

### Settings file structure

Settings are supposed to be stored in settings.js, in a root folder.
It should look like this:
```javascript
module.exports = {
   token: 'your_bot_token',
   names: ['some', "names", 'bot', 'should', 'react', 'to'],
   permissions: {
     write: [
       12345678900987654321 // telegram's id of user
     ]
   },
   protectedCommands: {
     '/jump': ['write']
   }
 };
```

 
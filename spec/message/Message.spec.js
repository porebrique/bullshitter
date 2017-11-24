import Message from '../../src/message';

const defaultMsg = {
  text: '',
  chat: {
    id: 'chat'
  },
  from: {}
};
const defaultOptions = {
  botNames: ['botname', 'otherbotname']
};

describe('Message class', () => {
  const getMessage = (msg = defaultMsg, options = defaultOptions) => new Message(msg, options);

  describe('.isSaidToBot', () => {

    it('knows when message is addressed to bot', () => {
      const messages= [
        'botname, hello',
        'BotName, hello',
        'otherbotname, hello'
      ];
      messages.forEach(text => {
        const message = getMessage({ text: text }, );
        expect(message.isSaidToBot()).toBe(true);
      });
    });
    it('knows when message is NOT addressed to bot', () => {
      const messages= [
        'Someguy, hello',
        'hello, botname'
      ];
      messages.forEach(text => {
        const message = getMessage({ text: text });
        expect(message.isSaidToBot()).toBe(false);
      });
    });
  });

  it('.getText removes bot\'s mentions from text and returns result', () => {
    const message = getMessage();
    message.removeBotMentions = () => 'correct text';
    expect(message.getText()).toBe('correct text');
  });

  it('.isCommand', () => {
    let message = getMessage({ text: '/command' });
    expect(message.isCommand()).toBeTruthy();

    message = getMessage({ text: 'hello' });
    expect(message.isCommand()).toBeFalsy();
  });

  it('.removeBotMentions removes bot\'s names from message', function () {
    const matchTable = [
      ['botname, hello','hello'],
      ['botname hello', 'hello'],
      ['botnameololo', 'botnameololo'],
      ['botname, botname', 'botname'],
      ['botname', ''],
      ['notname, hello', 'notname, hello'],
      ['hey, botname', 'hey, botname']
    ];
    matchTable.map(pair => {
      const [ text, expectedResult ] = pair;
      const message = getMessage({ text });
      expect(message.removeBotMentions()).toBe(expectedResult);
    });
  });

});

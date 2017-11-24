import MessageProcessor from '../src/message-processor';
import bullshitter from '../src/bullshitter';
import settings from '../settings';
import { Mocker } from './helpers';

const settingsMock = {
  randomPhraseChance: 50,
  names: ['botname', 'otherbotname']
};

const bullshitterMock = {
  getBullshit: jest.fn(() => 'some bullshit')
};

describe('MessageProcessor', function (){
  let settingsMocker;
  let bullshitMocker;
  let processor;

  beforeEach(() => {
    settingsMocker = new Mocker(settings, settingsMock);
    bullshitMocker = new Mocker(bullshitter, bullshitterMock);
    processor = new MessageProcessor(bot)
  });

  afterEach(() => {
    settingsMocker.restore();
    bullshitMocker.restore();
  });

  var bot = {};

  it("Knows how to removes bot's names from message", function () {
    const matchTable = [
          ['botname, hello','hello'],
          ['botname hello', 'hello'],
          ['botnameololo', 'botnameololo'],
          ['botname, botname', 'botname'],
          ['botname', ''],
          ['notname, hello', 'notname, hello'],
          ['hey, botname', 'hey, botname']
        ];
    matchTable.map(function (pair) {
      expect(processor.removeBotMentions(pair[0])).toBe(pair[1]);
    });
  });

  describe('.isTimeToSayRandomly', () => {
    let mathMocker;

    afterEach(() => {
      mathMocker.restore();
    });

    it('returns true if random chance is lower than configured threshold', () => {
      mathMocker = new Mocker(Math, { random: () => 0.4 });
      expect(processor.constructor.isTimeToSayRandomly()).toBe(true);
    });

    it('returns false if random chance is higher than configured threshold', () => {
      mathMocker = new Mocker(Math, { random: () => 0.6 });
      expect(processor.constructor.isTimeToSayRandomly()).toBe(false);
    });
  });

  it('.getBullshit calls method from bullshitter', () => {
    expect(bullshitter.getBullshit).not.toHaveBeenCalled();
    const bullshit = processor.getBullshit();
    expect(bullshit).toBe('some bullshit');
    expect(bullshitter.getBullshit).toHaveBeenCalled();
  });

  it('.sendMessage', () => {
    const chatId = '123';
    const message = {};
    processor.bot.sendMessage = jest.fn();

    expect(processor.bot.sendMessage).not.toHaveBeenCalled();
    processor.sendMessage(chatId, message);
    expect(processor.bot.sendMessage).toHaveBeenCalledWith(chatId, message);
  });

  describe('.processMessage', () => {
    const generalMessage = { text: 'hello world' };
    const command = { text: '/hello world' };

    beforeEach(() => {
      processor.processCommand = jest.fn();
      processor.processGeneralMessage = jest.fn();
    });

    it('processes message as command when is supposed to', () => {
      processor.processMessage(generalMessage);
      expect(processor.processCommand).not.toHaveBeenCalled();
      expect(processor.processGeneralMessage).toHaveBeenCalled();
    });

    it('processes message as generic message when is supposed to', () => {
      processor.processMessage(command);
      expect(processor.processCommand).toHaveBeenCalled();
      expect(processor.processGeneralMessage).not.toHaveBeenCalled();
    });
  });

  describe('.processCommand', () => {
    const chatId = 'chatId';
    const message = { chat: { id: chatId }, text: 'message' };
    const mockReactionToCommand = reaction => {
      processor.commandProcessor.getReactionToCommand = () => reaction;
    };

    beforeEach(() => {
      processor.sendMessage = jest.fn();
    });

    it('if reaction to command is a function, it and sends a result as a message', () => {
      const reactionToCommand = ({ text }) => `${text} processed`;
      mockReactionToCommand(reactionToCommand);
      processor.processCommand(message);
      expect(processor.sendMessage).toHaveBeenCalledWith(chatId, 'message processed');
    });

    it('if reaction to command is a string, sends it as a message', () => {
      mockReactionToCommand('command result');
      processor.processCommand(message);
      expect(processor.sendMessage).toHaveBeenCalledWith(chatId, 'command result');
    });

    it('if reaction to command is netiher string nor function, sends nothing', () => {
      mockReactionToCommand(null);
      processor.processCommand(message);
      expect(processor.sendMessage).not.toHaveBeenCalled();
    });

  });

  describe('.sayRandomShit', () => {
    const msg = { text: 'oh hai' };

    it('tries to generate bullshit from message text cleared from bot\'s mentions', () => {
      processor.getBullshit = jest.fn();
      processor.removeBotMentions = text => text.replace('bot', '').trim();
      const msg = { text: 'bot hello' };
      processor.sayRandomShit(msg);
      expect(processor.getBullshit).toHaveBeenCalledWith('hello');
    });

    it('if bullshit was generated, returns it', () => {
      processor.getBullshit = text => text;
      expect(processor.sayRandomShit(msg)).toBe('oh hai');
    });

    it('if bullshit was not generated, returns null', () => {
      processor.getBullshit = () => '';
      expect(processor.sayRandomShit(msg)).toBe(null);
    });

  });

  describe('.isSaidToBot', () => {

    it('knows when message is addressed to bot', () => {
      const messages= [
        'botname, hello',
        'BotName, hello',
        'otherbotname, hello'
      ];
      messages.forEach(msg => {
        expect(processor.isSaidToBot(msg)).toBe(true);
      });
    });
    it('knows when message is NOT addressed to bot', () => {
      const messages= [
        'Someguy, hello',
        'hello, botname'
      ];
      messages.forEach(msg => {
        expect(processor.isSaidToBot(msg)).toBe(false);
      });
    });
  });

  describe('.processGeneralMessage', () => {
    const chatId = 'chatId';
    const message =  { text: 'hello', chat: { id: chatId } };
    const expectedResult = 'hello reply';

    beforeEach(() => {
      processor.sayRandomShit = msg => `${msg.text} reply`;
      processor.sendMessage = jest.fn();
    });

    describe('sends a reply', () => {
      it('if message was addressed to bot', () => {
        processor.isSaidToBot = () => true;
        processor.constructor.isTimeToSayRandomly = () => false;
        processor.processGeneralMessage(message);
        expect(processor.sendMessage).toHaveBeenCalledWith(chatId, expectedResult);
      });

      it('it is time to say random phrase', () => {
        processor.isSaidToBot = () => false;
        processor.constructor.isTimeToSayRandomly = () => true;
        processor.processGeneralMessage(message);
        expect(processor.sendMessage).toHaveBeenCalledWith(chatId, expectedResult);
      });

    });

    describe('doesn\'t send a reply', () => {
      it('if message was not addressed to bot and it is not a time to talk randomly', () => {
        processor.isSaidToBot = () => false;
        processor.constructor.isTimeToSayRandomly = () => false;
        processor.processGeneralMessage(message);
        expect(processor.sendMessage).not.toHaveBeenCalled();
      });
    });


  });

});

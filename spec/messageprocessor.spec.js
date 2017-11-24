import MessageProcessor from '../src/message-processor';
import bullshitter from '../src/bullshitter';
import Message from '../src/message';
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

  it('.getMessage returns an instance of Message', () => {
    const wrappedMessage = processor.getMessage({});
    expect(wrappedMessage instanceof  Message);
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
    const message = {};
    const wrappedMessage = new Message({}, {});

    beforeEach(() => {
      processor.processCommand = jest.fn();
      processor.processGeneralMessage = jest.fn();
      processor.getMessage = () => wrappedMessage;
    });

    it('processes message as command when is supposed to', () => {
      wrappedMessage.isCommand = () => true;
      processor.processMessage(message);
      // TODO: later an argument should be not original message, but a class' instance
      expect(processor.processCommand).toHaveBeenCalledWith(message);
      expect(processor.processGeneralMessage).not.toHaveBeenCalled();
    });

    it('processes message as generic message when is supposed to', () => {
      wrappedMessage.isCommand = () => false;
      processor.processMessage(message);
      expect(processor.processCommand).not.toHaveBeenCalled();
      expect(processor.processGeneralMessage).toHaveBeenCalledWith(wrappedMessage);
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

  describe('.processGeneralMessage', () => {
    const chatId = 'chatId';
    const message = new Message({ text: 'hello', chat: { id: chatId } }, {});
    const expectedResult = 'hello reply';

    beforeEach(() => {
      processor.getBullshit = text => `${text} reply`;
      message.getText = () => 'hello';
      message.getChatId = () => chatId;
      processor.sendMessage = jest.fn();
    });

    describe('sends a reply', () => {
      it('if message was addressed to bot', () => {
        message.isSaidToBot = () => true;
        processor.constructor.isTimeToSayRandomly = () => false;
        processor.processGeneralMessage(message);
        expect(processor.sendMessage).toHaveBeenCalledWith(chatId, expectedResult);
      });

      it('it is time to say random phrase', () => {
        message.isSaidToBot = () => false;
        processor.constructor.isTimeToSayRandomly = () => true;
        processor.processGeneralMessage(message);
        expect(processor.sendMessage).toHaveBeenCalledWith(chatId, expectedResult);
      });

    });

    describe('doesn\'t send a reply', () => {
      it('if message was not addressed to bot and it is not a time to talk randomly', () => {
        message.isSaidToBot = () => false;
        processor.constructor.isTimeToSayRandomly = () => false;
        processor.processGeneralMessage(message);
        expect(processor.sendMessage).not.toHaveBeenCalled();
      });
    });


  });

});

import MPConstructor from '../src/message-processor';
import settings from '../settings';
import { Mocker } from './helpers';

const settingsMock = {
  names: ['botname', 'otherbotname']
};

describe('MessageProcessor', function (){
  let settingsMocker;

  beforeEach(() => {
    settingsMocker = new Mocker(settings, settingsMock);
  });

  afterEach(() => {
    settingsMocker.restore();
  });

  var bot = {};

  it("Knows how to removes bot's names from message", function () {
    var mp = new MPConstructor(bot),
        matchTable = [
          ['botname, hello','hello'],
          ['botname hello', 'hello'],
          ['botnameololo', 'botnameololo'],
          ['botname, botname', 'botname'],
          ['botname', ''],
          ['notname, hello', 'notname, hello'],
          ['hey, botname', 'hey, botname']
        ];
    matchTable.map(function (pair) {
      expect(mp.removeBotMentions(pair[0])).toBe(pair[1]);
    });
  });
});
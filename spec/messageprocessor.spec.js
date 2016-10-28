var proxyquire =  require('proxyquire');
var MPConstructor = proxyquire('../src/message-processor', {
  '../settings.js': {
    names: ['botname', 'otherbotname']
  }
});


describe('MessageProcessor', function (){

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
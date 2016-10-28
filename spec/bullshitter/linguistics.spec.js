var utilsMock = require('../../src/utils/utils.mock');
var proxyquire =  require('proxyquire');

var storageMock = {
      getBullshitsContainingWord: function (word) {
        var result = [];
        var strings = [
          'one Two three',
          'four two five'
        ];

        strings.forEach(function(item){
          if (word && item.search(new RegExp(word, 'gi')) !== -1) {
            //console.log('MATCH for', word, item);
            result.push(item);
          }
        });
        return result;
      }
    };


var Ling = proxyquire('../../src/bullshitter/linguistics.js', {
  '../utils/utils.js': utilsMock,
  './bullshit-storage.js': storageMock
});

describe('Linguistic module', function () {

  describe('getMatchesSet() method returns correct matches set', function (){

    it('when there are mnatches', function () {
      var result = Ling.getMatchesSet('zero Two eleven');
      expect(result.matches.length).toBe(2);
      expect(result.word).toBe('two');

      result = Ling.getMatchesSet('twelve one twenty');
      expect(result.matches.length).toBe(1);
      expect(result.word).toBe('one');
    });

    it('when there is no match', function () {
      var result = Ling.getMatchesSet('YARRR YARR YARRRRRRR');
      expect(result.matches.length).toBe(0);
      expect(result.word).toBeFalsy();
    });


  });

  describe('getDecomposedString() method', function (){

    it('decomposes input to single words', function () {
      var string = '!One two-three,, "four". Five-six, seven! Eight?   Nine ?  ten.';
      var expectedResult = [
        'one',
        'two-three',
        'four',
        'five-six',
        'seven',
        'eight',
        'nine',
        'ten'
      ];
      var result = Ling.getDecomposedString(string);
      expectedResult.forEach(function(word, index) {
        expect(result[index]).toBe(word);
      });
    });
  });

  describe('.getPairToMerge()', function () {
    it('Returns a pair, which could be combined by given word', function () {
      var matches = [
        'One two three',
        'four one, five',
        'six seven one.',
        'eight one ten'
      ];
      var result = Ling.getPairToMerge(matches, 'one');
      expect(result[0]).toBe('four one, five');
      expect(result[1]).toBe('One two three');
    });
  });


  it('.mergePair() merges given pair of phrases by given word', function () {
    var result = Ling.mergePair(['One two, three', 'four two five'], 'two');
    expect(result).toBe('One two five');

    result = Ling.mergePair(['One two! three!', 'four two. Five?'], 'two');
    expect(result).toBe('One two. Five?');

    result = Ling.mergePair(['One-two three!', 'four two. Five?'], 'two');
    expect(result).toBe('One-two. Five?');

    result = Ling.mergePair(['One. two? three!', 'four two. Five?'], 'two');
    expect(result).toBe('One. two. Five?');

  });

});


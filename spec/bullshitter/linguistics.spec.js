import storage from '../../src/bullshitter/storage/bullshit-storage';
import utils from '../../src/utils/utils.js';
import utilsMock from '../../src/utils/utils.mock';
import Ling from '../../src/bullshitter/linguistics';
import { Mocker } from '../helpers';

// TODO: mock linguistic helpers


// TODO: consider using mocked functions instead of referring to shared storage mock
var storageMock = {
      getBullshitsContainingWord: function (word) {
        var result = [];
        var strings = [
          'one Two three',
          'four two five'
        ];

        strings.forEach(function(item){
          if (word && item.search(new RegExp(word, 'gi')) !== -1) {
            result.push({text: item});
          }
        });
        return result;
      }
    };

describe('Linguistic module', function () {
  let storageMocker;
  let utilsMocker;

  beforeEach(() => {
    storageMocker = new Mocker(storage, storageMock);
    utilsMocker = new Mocker(utils, utilsMock);
  });

  afterEach(() => {
    storageMocker.restore();
    utilsMocker.restore();
  });

  describe('getMatchesSet() method returns correct matches set', function (){

    it('when there are matches', function () {
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


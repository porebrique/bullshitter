import * as bullshitter from '../../src/bullshitter/bullshitter';
import { Mocker } from '../helpers';
import Ling from '../../src/bullshitter/linguistics';
import BullshitStorage from '../../src/bullshitter/storage/bullshit-storage';

var storageMock = {
  saveBullshit: function (text) {
    console.log('Mocked saving');
  },
  getRandomBullshit: function () {
    return 'random result';
  }
};

var matchesSearchAnswers = {
  "one": {
    word: 'one',
    matches: [
      {text: 'One two three'}
    ]
  },
  "two": {
    word: 'two',
    matches: [
      {text: 'One two three'},
      {text: 'four two five'}
    ]
  },
  "One two three": {
    word: 'two',
    matches: [
      {text: 'One two three'},
      {text: 'four two five'}
    ]
  },
  "eleven": {
    word: 'eleven',
    matches: [
      {text: 'Ten eleven twelve'}
    ]
  }
};

var linguisticsMock = {
  getMatchesSet: function (input) {
    return matchesSearchAnswers[input] || {matches: [], word: 'whatever'};
  },

  getPairToMerge: function (input) {
    return input;
  }
};

// TODO: figure out how to refactor tests for using with real DB and de-comment
describe("Bullshitter's", function () {

  let storageMocker;
  let linguisticsMocker;

  beforeEach(() => {
    storageMocker = new Mocker(BullshitStorage, storageMock);
    linguisticsMocker = new Mocker(Ling, linguisticsMock);
  });

  afterEach(() => {
    storageMocker.restore();
    linguisticsMocker.restore();
  });


  describe('(getBullshit) method', function (){
    it('exists', function () {
      expect(typeof bullshitter.getBullshit).toBe('function');
    });


    it('returns correct mix of DB items having one common word with input', function () {
      var mix = bullshitter.getBullshit('two');
      expect(mix).toBe('One two five');
    });

    describe('when only one match found, tries to mix it with some matches for this only match', function(){
      it('and returns mix if it is possible', function (){
        var mix = bullshitter.getBullshit('one');
        expect(mix).toBe('One two five');
      });

      it('and returns just single match when it doesnt have common words with anything in DB', function (){
        var mix = bullshitter.getBullshit('eleven');
        expect(mix).toBe('Ten eleven twelve');
      });
    });

    it('returns random bullshit When input sentence has NO matches in db', function (){
      var mix = bullshitter.getBullshit('phrase that has no matches');
      expect(mix).toBe('Random result');
    });

  });


});


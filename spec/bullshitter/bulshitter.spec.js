var proxyquire =  require('proxyquire');

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


var bullshitter = proxyquire('../../src/bullshitter/index.js', {
  './linguistics.js': linguisticsMock,
  './bullshit-storage.js': storageMock
});

// TODO: figure out how to refactor tests for using with real DB and de-comment
describe("Bullshitter's", function () {


  describe('(getBullshit) method', function (){
    it('exists', function () {
      expect(typeof bullshitter.getBullshit).toBe('function');
    });


    it('returns correct mix of DB items having one common word with input', function () {
      var mix = bullshitter.getBullshit('two');
      expect(mix).toBe('One two five');
    });

    // TODO: fix test
    xit('when only one match found, tries to mix it with some matches for this only match (keeping word from input)', function (){
      var mix = bullshitter.getBullshit('one');
      expect(mix).toBe('One two five');
    });

    // TODO: fix test
    xit('returns random bullshit When input sentence has NO matches in db', function (){
      var mix = bullshitter.getBullshit('phrase that has no matches');
      expect(mix).toBe('Random result');
    });




  });


});


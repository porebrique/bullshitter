import helpers from '../../../src/bullshitter/linguistics/helpers';

describe('Linguistic helpers', () => {

  describe('getDecomposedString() method', function (){

    it('decomposes input to single words', function () {
      const string = '!One two-three,, "four". Five-six, seven! Eight?   Nine ?  ten.';
      const expectedResult = [
        'one',
        'two-three',
        'four',
        'five-six',
        'seven',
        'eight',
        'nine',
        'ten'
      ];
      const result = helpers.getDecomposedString(string);
      expectedResult.forEach((word, index) => {
        expect(result[index]).toBe(word);
      });
    });
  });


  describe('search results', function() {
    const searchResults = [
      {text: 'One two three'},
      {text: 'One two three'},
      {text: 'One "two" three'},
      {text: 'One " two " three'},
      {text: 'One (two three)'},
      {text: 'One (three two )'},
      {text: 'One [two] three'},
      {text: 'One «two» three'}
    ];

    it('dont include phrases when common word is surrounded by some symbols like quotes', function () {
      const filteredResults = helpers.filterSearchResults(searchResults, [], 'two');
      expect(filteredResults.length).toBe(1);
    });
  });

});

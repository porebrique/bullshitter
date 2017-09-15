var utils = require('../../src/utils/utils.js');


describe('Utils', function () {
  describe('getRandomArrayElement', function(){
    var getRandom = utils.getRandomArrayElement;

    it('returns random element', function (){
      var array = [1];
      expect(getRandom(array)).toBe(1);
    });

    it('returns random element but not excluded', function (){
      var array = [0,1,2,3,4,5,6,7,8,9];
      // На каждой итерации список недопустимых элементов задан так,
      // что результатом может быть только единственный вариант. Это и проверяем.
      array.map(function (onlyAllowedElement, onlyAllowedElementIndex){
        var excludedElements = [].concat(array);
        excludedElements.splice(onlyAllowedElementIndex, 1);
        expect(getRandom(array, excludedElements)).toBe(onlyAllowedElement);
      });
    })
  });

});
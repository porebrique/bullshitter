
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getRandomArrayIndex(arr) {
  var min = 0,
    max = arr.length - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;
  //return getRandomInt(0, arr.length - 1);
}

/**
 * Returns random array element which is not listed in given excluded values array
 * @param {Array} arr
 * @param {Array} aExcludedElements
 * @returns {*}
 */
function getRandomArrayElement(arr, aExcludedElements) {
  var result = arr[getRandomArrayIndex(arr)];

  if (aExcludedElements && aExcludedElements.indexOf(result) !== -1) {
    var allowedValues = [].concat(arr);
    aExcludedElements.map(function(excludedElement) {
      allowedValues.splice(allowedValues.indexOf(excludedElement), 1);
    });
    result = allowedValues[getRandomArrayIndex(allowedValues)];
  }
  return result;
}

module.exports = {
  getRandomArrayElement: getRandomArrayElement
};
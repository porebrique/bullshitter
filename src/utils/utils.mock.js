/**
 * Works like real method but always returns first element not mentioned in excludeds
 * @param arr
 * @param excluded
 * @returns {*|null}
 */
function getRandomArrayElement(arr, excluded) {
    var result;
    for (var i = 0; !result && i < arr.length; i++) {
      var item = arr[i];
      if (!excluded || excluded.indexOf(item) === -1) {
        result = item;
      }
    }
    return result || null;
}

module.exports = {
  getRandomArrayElement: getRandomArrayElement
};
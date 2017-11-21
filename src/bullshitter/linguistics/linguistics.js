import * as lodash from 'lodash';
import utils from '../../utils/utils';
import storage from '../storage/bullshit-storage.js';
import Validate from './validations';
import helpers from './helpers';

/* ----------------------------------------------- */

//TODO: search must not be performed for words inside (), "", [], «», etc, in BOTH phrases (now it is done for DB phrases only)
//TODO: consider creating getResponseToOneWord, with searching by "word", then "wor", then "wo" etc
// Actually it could be always useful since search is performed by single word at some stage.
// But it cant be used blindly, simple reducing number of letters, as it could lead to senseless matches

/**
 * Tries to return set of stored phrases containing word from given string (or array)
 * @param {String | Array} input
 * @returns {{matches: Array, word: String}}
 */
const getMatchesSet = (input, initialExcludes = []) => {
  // this method can be called recursively.
  // To avoid unneeded operations, all manipulations over arguments can be done once,
  // and then results are passed as arguments for recursive call.
  // TODO: not sure if this optimization makes sense.
  // TODO consider changing signature to get obvious recursive flag. NB: isnt'it called from somewhere with not a string arg?
  const isInitialCall = lodash.isString(input);
  const { getDecomposedString, filterSearchResults } = helpers;
  const decomposedInput = isInitialCall ? getDecomposedString(input) : input;
  const excludes = isInitialCall ? [input] : initialExcludes;
  const randomWord = utils.getRandomArrayElement(decomposedInput);
  let foundMatches;
  let result;

  if (randomWord) {
    foundMatches = storage.getBullshitsContainingWord(randomWord);
    foundMatches = filterSearchResults(foundMatches, randomWord, excludes);

    switch (foundMatches.length) {
      case 0:
        // when no matches found, try again with reduced word set
        const reducedDecomposedInput = lodash.without(decomposedInput, randomWord);
        result = getMatchesSet(reducedDecomposedInput, excludes);
        break;
      case 1:
        // TODO: backup result and try again another word instead of simple returning single match
        break;
      default:
        break;
    }
  }

  return result || {
    word: randomWord,
    matches: foundMatches || []
  };

};

const getPairToMerge = (phrasesArray, word) => {
  const { getLeftSentence, getRightSentence } = helpers;
  const leftSentence = getLeftSentence(phrasesArray, word);
  const rightSentence = leftSentence && getRightSentence(phrasesArray, word, [leftSentence]);
  return rightSentence ? [leftSentence, rightSentence] : null;
};

/* ---------------------------------------------   */

// TODO: consider changing condition like "shared word should not be first one" to "phrase must have at least N words before shared one"
// Otherwise some phrases are merged weird.

/**
 * Takes parts of two phrases and combines them so given word will be shared
 * @param {Array} input  two phrases in array, order is important.
 * @param {String} sharedWord
 * @returns {String}
 */
const mergePhrases = (input, sharedWord) => {
  Validate.mergePhrases.input(input, sharedWord);
  const leftHalfRegexp = new RegExp('^.*[\\s-]' + sharedWord, 'i');
  const rightHalfRegexp = new RegExp('(\\s|^)' + sharedWord + '[\\s\\.,!?]+[\\S\\s]*$', 'i');
  const wordReplacementRegexp = new RegExp(sharedWord, 'i');
  // take part of first phrases from beginning to shared word (including)
  const resultStart = input[0].match(leftHalfRegexp)[0];
  // take part of second phrase from shared word to the end. Then remove shared word (it is in 1st phrase)
  const resultEnd = input[1]
      .match(rightHalfRegexp)[0]
      .trim()
      .replace(wordReplacementRegexp, '');
  const result = resultStart + resultEnd;
  Validate.mergePhrases.output(result);
  return result;
};

/*----------------------------------------------   */

module.exports = {
  mergePair: mergePhrases,
  getPairToMerge,
  getMatchesSet
};
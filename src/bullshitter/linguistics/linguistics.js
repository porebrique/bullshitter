import * as lodash from 'lodash';
import utils from '../../utils/utils';
import storage from '../storage/bullshit-storage.js';
import Validate from './validations';

/* ----------------------------------------------- */

//TODO: consider excluding words like "and", an so on, as its hard to predict morphology of surrounding words
/**
 * Decomposes given text to single words, stripped of punctuation
 * @param {String} inputText
 * @returns {Array}
 */
const getDecomposedString = inputText => {
  return inputText
    .toLowerCase()
    .replace(/[,.?!'"«»]/gi, '')
    .replace(/\s+/gi, ' ')
    .split(' ');
};

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

/**
 * Checks if given word is no surrounded by symbols that make impossible breaking phrase by this word.
 * @param {String} bullshit
 * @param {String} word
 * @returns {Bool}
 */
const bullshitIsAppropriateForMerging = (bullshit, word) => {
  const enclosingSymbols = [
    ['\"', '\"'],
    ['\\(', '\\)'],
    ["\'", "\'"],
    ['\\[', '\\]'],
    ['«', '»']
  ];
  // TODO: change to filtering the array and checking its length. Could be simpler
  // TODO: dont do this without tests
  return enclosingSymbols.reduce((result, symbolsPair) => {
    const [ openingSymbol, closingSymbol ] = symbolsPair;
    const regexp = new RegExp(openingSymbol + '.*(' + word + ').*' + closingSymbol, 'gi');
    const localMatch = !!bullshit.match(regexp);
    return result && !localMatch;
  }, true);
};

/*
 *  Ensures following things:
 *  - Only unique texts
 *  - Only texts not listed as exceptions
  * - Only strings appropriate for merging (means no quotes and other things able to make merging complicated)
 */
const filterSearchResults = (matches, word, excludes = []) => {
  const matchesWithoutExcludes = matches.filter(item => !lodash.includes(excludes, item.text));
  const uniqueItems = lodash.uniqBy(matchesWithoutExcludes, 'text');
  return uniqueItems.filter(item => bullshitIsAppropriateForMerging(item.text, word));
};

/* ------------- Search for mergeable pair --------------   */
const phraseCanBeLeftHalf = (phrase, word) => {
  Validate.phraseCanBeLeftHalf.input(phrase, word);
  const regexp = new RegExp('^' + word, 'gi');  //sure about g?
  const result = !phrase.match(regexp);
  Validate.phraseCanBeLeftHalf.output(result);
  return result;
};

const phraseCanBeRightHalf = (phrase, word) => {
  const regexp = new RegExp(word + '[.!?]*$', 'gi');  //sure about g?
  return !phrase.match(regexp);
};

const getLeftSentence = (variants, word, excludedVariants) => {
  let result = utils.getRandomArrayElement(variants, excludedVariants);
  if (result && !phraseCanBeLeftHalf(result, word)) {
      excludedVariants = excludedVariants ? excludedVariants : [];
      excludedVariants.push(result);
      result = getLeftSentence(variants, word, excludedVariants);
  }
  return result || null;
};

const getRightSentence =(variants, word, excludedVariants) => {
  let result = utils.getRandomArrayElement(variants, excludedVariants);
  if (result && !phraseCanBeRightHalf(result, word)) {
    excludedVariants = excludedVariants ? excludedVariants : [];
    excludedVariants.push(result);
    result = getRightSentence(variants, word, excludedVariants);
  }
  return result;
};

const getPairToMerge = (phrasesArray, word) => {
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
  // TODO: export only methods used outside of this module, moving rest of them to separate unit
  filterSearchResults,
  mergePair: mergePhrases,
  getPairToMerge,
  getMatchesSet,
  getDecomposedString
};
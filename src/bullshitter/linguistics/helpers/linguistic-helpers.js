import * as lodash from 'lodash';
import utils from '../../../utils/utils';
import Validate from '../validations';

/* ----------------------------------------------- */


/* ------------- Search for mergeable pair --------------   */
const _canPhraseBeLeftHalf = (phrase, word) => {
  Validate.phraseCanBeLeftHalf.input(phrase, word);
  const regexp = new RegExp('^' + word, 'gi');  //sure about g?
  const result = !phrase.match(regexp);
  Validate.phraseCanBeLeftHalf.output(result);
  return result;
};

const _canPhraseBeRightHalf = (phrase, word) => {
  const regexp = new RegExp(word + '[.!?]*$', 'gi');  //sure about g?
  return !phrase.match(regexp);
};

const getLeftSentence = (variants, word, excludedVariants) => {
  let result = utils.getRandomArrayElement(variants, excludedVariants);
  if (result && !_canPhraseBeLeftHalf(result, word)) {
    excludedVariants = excludedVariants ? excludedVariants : [];
    excludedVariants.push(result);
    result = getLeftSentence(variants, word, excludedVariants);
  }
  return result || null;
};

const getRightSentence =(variants, word, excludedVariants) => {
  let result = utils.getRandomArrayElement(variants, excludedVariants);
  if (result && !_canPhraseBeRightHalf(result, word)) {
    excludedVariants = excludedVariants ? excludedVariants : [];
    excludedVariants.push(result);
    result = getRightSentence(variants, word, excludedVariants);
  }
  return result;
};

/* ----------------------------------------------- */
/**
 * Checks if given word is no surrounded by symbols that make impossible breaking phrase by this word.
 * @param {String} bullshit
 * @param {String} word
 * @returns {Bool}
 */
const _isBullshitValidForMerging = (bullshit, word) => {
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

/*
 *  Ensures following things:
 *  - Only unique texts
 *  - Only texts not listed as exceptions
 * - Only strings appropriate for merging (means no quotes and other things able to make merging complicated)
 */
const filterSearchResults = (matches, word, excludes = []) => {
  const matchesWithoutExcludes = matches.filter(item => !lodash.includes(excludes, item.text));
  const uniqueItems = lodash.uniqBy(matchesWithoutExcludes, 'text');
  return uniqueItems.filter(item => _isBullshitValidForMerging(item.text, word));
};


export {
  getRightSentence,
  getLeftSentence,
  getDecomposedString,
  filterSearchResults
};

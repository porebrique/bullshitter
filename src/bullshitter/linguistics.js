var utils = require('../utils/utils.js');
var storage = require('./storage/bullshit-storage.js');
var Assert = require('assert');

var Validate = {
  mergePhrases: {
    input: function (input, sharedWord){
      Assert(Array.isArray(input));
      Assert(typeof input[0] === 'string');
      Assert(typeof input[1] === 'string');
      Assert(typeof sharedWord === 'string');

      var sharedWordRegexp = new RegExp(sharedWord, 'i');
      Assert(input[0].match(sharedWordRegexp));
      Assert(input[1].match(sharedWordRegexp));

    },
    output: function (output) {
      Assert(typeof output === 'string')
    }
  },

  phraseCanBeLeftHalf: {
    input: function (phrase, word) {
      Assert(typeof phrase === "string"); // fails sometime
      Assert(typeof word === "string")
    },
    output: function (result) {
      Assert(typeof result === 'boolean');
    }
  }
};

/* ----------------------------------------------- */

//TODO: consider excluding words like "and", an so on, as its hard to predict morphology of surrounding words
/**
 * Decomposes given text to single words, stripped of punctuation
 * @param {String} inputText
 * @returns {Array}
 */
function getDecomposedString(inputText) {
  var result = inputText
        .toLowerCase()
        .replace(/[,.?!'"«»]/gi, '')
        .replace(/\s+/gi, ' ')
        .split(' ');
  // TODO: extract root if possible
  return result;
}

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
function getMatchesSet(input, excludes) {
  var decomposedInput = typeof input === 'string' ? getDecomposedString(input) : input,
      excludes = typeof input === 'string' ? [input] : excludes,
      randomWord = utils.getRandomArrayElement(decomposedInput),
      foundMatches,
      result;

  if (randomWord) {
    foundMatches = storage
      .getBullshitsContainingWord(randomWord)
      .filter(function(item) {
        return !excludes || excludes.indexOf(item.text) === -1;
      });
      foundMatches = filterSearchResults(foundMatches, randomWord);

    switch (foundMatches.length) {
      case 0:
        // when no matches found, try again with reduced word set
        decomposedInput.splice(decomposedInput.indexOf(randomWord), 1);
        result = getMatchesSet(decomposedInput, excludes);
        break;
      case 1:
        // TODO: backup result and try again another word instead of simple returning single match
        //console.log('found single match:', result.matches[0]);
        break;
      default:
        //console.log('found 2 or more matches');
        break;
    }
  }

  return result || {
    word: randomWord,
    matches: foundMatches || []
  };

}

/**
 * Checks if given word is no surrounded by symbols that make impossible breaking phrase by this word.
 * @param {String} bullshit
 * @param {String} word
 * @returns {Bool}
 */
function bullshitIsAppropriateForMerging(bullshit, word) {
  return [
    ['\"', '\"'],
    ['\\(', '\\)'],
    ["\'", "\'"],
    ['\\[', '\\]'],
    ['«', '»']
  ].reduce(function (result, symbolsPair) {
    var regexp = new RegExp(symbolsPair[0] + '.*(' + word + ').*' + symbolsPair[1], 'gi'),
        localMatch = !!bullshit.match(regexp);
    return result && !localMatch;
  }, true);
}

function filterSearchResults(matches, word) {
  return ensureUniqueness(matches).filter(function (item) {
    return bullshitIsAppropriateForMerging(item.text, word);
  });
}

/**
 * Excludes items with duplicate "text" field, leaving only one of them
 * @param {Array} matchesSet
 * @returns {Array}
 */
function ensureUniqueness(matchesSet) {
  var excludes = [];
  return matchesSet.filter(function(item) {
    var itemIsUnique = excludes.indexOf(item.text) === -1;
    if (itemIsUnique) {
      excludes.push(item.text);
    }
    return itemIsUnique;
  });
}

/* ------------- Search for mergeable pair --------------   */
function phraseCanBeLeftHalf(phrase, word) {
  Validate.phraseCanBeLeftHalf.input.apply(null, arguments);
  var regexp = new RegExp('^' + word, 'gi'),  //sure about g?
      result = !phrase.match(regexp);
  Validate.phraseCanBeLeftHalf.output(result);
  return result;
}

function phraseCanBeRightHalf(phrase, word) {
  var regexp = new RegExp(word + '[.!?]*$', 'gi');  //sure about g?
  return !phrase.match(regexp);
}

function getLeftSentence(variants, word, excludedVariants) {
  var result = utils.getRandomArrayElement(variants, excludedVariants);
  if (result && !phraseCanBeLeftHalf(result, word)) {
      excludedVariants = excludedVariants ? excludedVariants : [];
      excludedVariants.push(result);
      result = getLeftSentence(variants, word, excludedVariants);
  }
  return result || null;
}

function getRightSentence(variants, word, excludedVariants) {
  var result = utils.getRandomArrayElement(variants, excludedVariants);
  if (result && !phraseCanBeRightHalf(result, word)) {
    excludedVariants = excludedVariants ? excludedVariants : [];
    excludedVariants.push(result);
    result = getRightSentence(variants, word, excludedVariants);
  }
  return result;
}

function getPairToMerge(phrasesArray, word) {
  var leftSentence = getLeftSentence(phrasesArray, word),
      rightSentence = leftSentence && getRightSentence(phrasesArray, word, [leftSentence]);
  return (rightSentence && [leftSentence, rightSentence]) || null;
}

/* ---------------------------------------------   */

// TODO: consider changing condition like "shared word should not be first one" to "phrase must have at least N words before shared one"
// Otherwise some phrases are merged weird.

/**
 * Takes parts of two phrases and combines them so given word will be shared
 * @param {Array} input  two phrases in array, order is important.
 * @param {String} sharedWord
 * @returns {String}
 */
function mergePhrases(input, sharedWord) {
  Validate.mergePhrases.input.apply(null, arguments);
  var leftHalfRegexp = new RegExp('^.*[\\s-]' + sharedWord, 'i'),
      rightHalfRegexp = new RegExp('(\\s|^)' + sharedWord + '[\\s\\.,!?]+[\\S\\s]*$', 'i'),
      wordReplacementRegexp = new RegExp(sharedWord, 'i'),
  // take part of first phrases from beginning to shared word (including)
    resultStart = input[0].match(leftHalfRegexp)[0],
  // take part of second phrase from shared word to the end. Then remove shared word (it is in 1st phrase)
    resultEnd = input[1]
      .match(rightHalfRegexp)[0]
      .trim()
      .replace(wordReplacementRegexp, ''),
    result = resultStart + resultEnd;
  Validate.mergePhrases.output(result);
  return result;
}

/*----------------------------------------------   */

module.exports = {
  filterSearchResults: filterSearchResults,
  mergePair: mergePhrases,
  getPairToMerge: getPairToMerge,
  getMatchesSet: getMatchesSet,
  getDecomposedString: getDecomposedString
};
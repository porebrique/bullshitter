
var utils = require('../utils/utils.js'),
    Linguistics = require('./linguistics.js'),
    BullshitStorage = require('./storage/bullshit-storage.js');


function removeWhitespacesBeforePunctuation(sString) {
  return sString.replace(/(\s)([,.?!]+)/g, '$2');
}
function CapitalizeWholePhrase (sString) {
  return sString.charAt(0).toUpperCase() + sString.slice(1);
}

function transformOutput(bullshitText) {
  return CapitalizeWholePhrase(removeWhitespacesBeforePunctuation(bullshitText));
}

/* ------------------------------------*/

function extractStringsFromDBItems (input) {
  var result = input.map(function (item){
    return item.text;

  });
  return result;
}

function mergeSomethingFromArray(aStrings, word) {
  var mergeablePair = Linguistics.getPairToMerge(aStrings, word);
  return mergeablePair && Linguistics.mergePair(mergeablePair, word);
}

/**
 * Tries to merge received phrase with some other from base.
 * If phrase does not have any matches to stored items by any word
 * @param input
 * @returns {Number|Array.<T>|string|*|String}
 */
function mergeSomethingWith(input) {
  var matchesSet = Linguistics.getMatchesSet(input),
      extractedPhrases = matchesSet.matches.length && extractStringsFromDBItems(matchesSet.matches).concat([input]);
  return extractedPhrases && mergeSomethingFromArray(extractedPhrases, matchesSet.word) || null;
}

function getBullshit(input) {
  var matchesForInput = Linguistics.getMatchesSet(input), // could be 0, 1 or many
      bullshitToSave,
      bullshitToSay;

  switch (matchesForInput.matches.length) {
    case 0:
      bullshitToSay = mergeSomethingWith(BullshitStorage.getRandomBullshit());
      break;
    case 1:
      bullshitToSay = mergeSomethingWith(matchesForInput.matches[0].text);
      if (!bullshitToSay) {
        // If cant merge with anything (when phrase doesnt have shared words with any record from db) then get random
        bullshitToSay = matchesForInput.matches[0].text;
      } else if (bullshitToSay.indexOf(matchesForInput.word) !== -1) {
        // if something was merged, save result, but only if it has something in common with input
        bullshitToSave = bullshitToSay;
      }

      break;
    default:
      var extractedPhrases = extractStringsFromDBItems(matchesForInput.matches);
      bullshitToSay = bullshitToSave = mergeSomethingFromArray(extractedPhrases, matchesForInput.word);
      break;
  }

  if (bullshitToSave) {
    BullshitStorage.saveBullshit(bullshitToSave);
  }

  return transformOutput(bullshitToSay || BullshitStorage.getRandomBullshit());
}





module.exports =  {
  getBullshit: getBullshit
};
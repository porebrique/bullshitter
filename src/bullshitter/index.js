
var utils = require('../utils/utils.js'),
    Linguistics = require('./linguistics.js'),
    BullshitStorage = require('./bullshit-storage.js');

function transformOutput(bullshitText) {
  return bullshitText.charAt(0).toUpperCase() + bullshitText.slice(1);
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


function mergeSomethingWith(input) {
  var matchesSet = Linguistics.getMatchesSet(input),
      extractedPhrases = extractStringsFromDBItems(matchesSet.matches).concat([input]);
  // TODO: next line fails when matchesSet returns [] and undefined as word
  return mergeSomethingFromArray(extractedPhrases, matchesSet.word);
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
      bullshitToSay = mergeSomethingWith(matchesForInput.matches[0]);
      if (bullshitToSay.indexOf(matchesForInput.word) !== -1) {
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
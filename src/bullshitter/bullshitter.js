import Linguistics from './linguistics';
import BullshitStorage from './storage/bullshit-storage';

const removeWhitespacesBeforePunctuation = sString => sString.replace(/(\s)([,.?!]+)/g, '$2');
const CapitalizeWholePhrase = sString => sString.charAt(0).toUpperCase() + sString.slice(1);
const transformOutput = bullshitText => CapitalizeWholePhrase(removeWhitespacesBeforePunctuation(bullshitText));

/* ------------------------------------*/

const extractStringsFromDBItems = input => input.map(item => item.text);

const mergeSomethingFromArray = (aStrings, word) => {
  const mergeablePair = Linguistics.getPairToMerge(aStrings, word);
  return mergeablePair && Linguistics.mergePair(mergeablePair, word);
};

/**
 * Tries to merge received phrase with some other from base.
 * If phrase does not have any matches to stored items by any word
 * @param input
 * @returns {Number|Array.<T>|string|*|String}
 */
const mergeSomethingWith = input => {
  const matchesSet = Linguistics.getMatchesSet(input);
  const extractedPhrases = matchesSet.matches.length && extractStringsFromDBItems(matchesSet.matches).concat([input]);
  return extractedPhrases && mergeSomethingFromArray(extractedPhrases, matchesSet.word) || null;
};

const getBullshit = input => {
  const matchesForInput = Linguistics.getMatchesSet(input); // could be 0, 1 or many
  let bullshitToSave;
  let bullshitToSay;

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
      const extractedPhrases = extractStringsFromDBItems(matchesForInput.matches);
      bullshitToSay = bullshitToSave = mergeSomethingFromArray(extractedPhrases, matchesForInput.word);
      break;
  }

  if (bullshitToSave) {
    BullshitStorage.saveBullshit(bullshitToSave);
  }

  return transformOutput(bullshitToSay || BullshitStorage.getRandomBullshit());
};

export {
  getBullshit
};

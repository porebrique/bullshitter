import Linguistics from './linguistics';
import BullshitStorage from './storage/bullshit-storage';

const removeWhitespacesBeforePunctuation = sString => sString.replace(/(\s)([,.?!]+)/g, '$2');
const CapitalizeWholePhrase = sString => sString.charAt(0).toUpperCase() + sString.slice(1);
const transformOutput = bullshitText => CapitalizeWholePhrase(removeWhitespacesBeforePunctuation(bullshitText));

/* ------------------------------------*/

const extractStringsFromDBItems = input => input.map(item => item.text);

/*
  Tries to merge some of provided phrases, returns null can't
  @returns {String|null}
 */
const mergeSomethingFromArray = (aStrings, word) => {
  const mergeablePair = Linguistics.getPairToMerge(aStrings, word);
  return mergeablePair && Linguistics.mergePair(mergeablePair, word);
};

/**
 * Tries to merge received phrase with some other from base.
 * If phrase does not have any matches to stored items by any word
 * @param input
 * @returns {String|null}
 */
const mergeSomethingWith = input => {
  const { matches, word } = Linguistics.getMatchesSet(input);
  if (!matches.length) {
    return null;
  }
  // TODO: Why adding input?
  const extractedPhrases = extractStringsFromDBItems(matches).concat([input]);
  return mergeSomethingFromArray(extractedPhrases, word);
};

const getBullshit = input => {
  const { matches, word } = Linguistics.getMatchesSet(input); // could be 0, 1 or many
  let bullshitToSave;
  let bullshitToSay;

  switch (matches.length) {
    case 0:
      bullshitToSay = mergeSomethingWith(BullshitStorage.getRandomBullshit());
      break;
    case 1:
      bullshitToSay = mergeSomethingWith(matches[0].text);
      if (!bullshitToSay) {
        // If cant merge with anything (when phrase doesnt have shared words with any record from db) then get random
        bullshitToSay = matches[0].text;
      } else if (bullshitToSay.indexOf(word) !== -1) {
        // TODO: is it even possible for bullshitToSay to not contain WORD? If yes, how is it valid?
        // if something was merged, save result, but only if it has something in common with input
        bullshitToSave = bullshitToSay;
      }

      break;
    default:
      const extractedPhrases = extractStringsFromDBItems(matches);
      bullshitToSay = bullshitToSave = mergeSomethingFromArray(extractedPhrases, word);
      break;
  }

  if (bullshitToSave) {
    BullshitStorage.saveBullshit(bullshitToSave);
  }

  // TODO: Not sure if code after || is ever called)
  return transformOutput(bullshitToSay || BullshitStorage.getRandomBullshit());
};

export {
  getBullshit
};

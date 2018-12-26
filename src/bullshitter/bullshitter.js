import Linguistics from './linguistics';
import BullshitStorage from './storage/bullshit-storage';
import {
  extractStringsFromDBItems,
  mergeSomethingFromArray,
  mergeSomethingWith,
  transformOutput
} from "./utils";

/* ------------------------------------*/

const getBullshit = input => {
  const { matches, word } = Linguistics.getMatchesSet(input); // could be 0, 1 or many
  let bullshit;
  let shouldSave;

  switch (matches.length) {
    case 0:
      bullshit = mergeSomethingWith(BullshitStorage.getRandomBullshit());
      break;
    case 1:
      const [ singleMatch ] = matches;
      bullshit = mergeSomethingWith(singleMatch.text);
      if (!bullshit) {
        // If cant merge with anything (when phrase doesnt have shared words with any record from db) then get random
        bullshit = singleMatch.text;
      } else if (bullshit.includes(word)) {
        // TODO: is it even possible for bullshitToSay to not contain WORD? If yes, how is it valid?
        // if something was merged, save result, but only if it has something in common with input
        shouldSave = true;
      }

      break;
    default:
      const extractedPhrases = extractStringsFromDBItems(matches);
      bullshit = mergeSomethingFromArray(extractedPhrases, word);
      shouldSave = true;
      break;
  }

  if (shouldSave && bullshit) {
    BullshitStorage.saveBullshit(bullshit);
  }

  return transformOutput(bullshit || BullshitStorage.getRandomBullshit());
};

export {
  getBullshit
};

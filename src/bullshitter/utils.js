import Linguistics from "./linguistics/index";

const removeWhitespacesBeforePunctuation = sString => sString.replace(/(\s)([,.?!]+)/g, '$2');
const CapitalizeWholePhrase = sString => sString.charAt(0).toUpperCase() + sString.slice(1);
const transformOutput = bullshitText => CapitalizeWholePhrase(removeWhitespacesBeforePunctuation(bullshitText));

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

export {
  mergeSomethingFromArray,
  mergeSomethingWith,
  extractStringsFromDBItems,
  transformOutput
};

var loki = require('lokijs'),
  utils = require('../../utils/utils.js'),
  settings = require('../../../settings.js'),
  Validate = require('./bullshit-storage.validation.js'),
  db = new loki('db.json');

db.loadDatabase();


const MAX_BULLSHIT_LENGTH = 300,
  MAX_GENERATED_BULLSHIT_COLLECTION = 100;

/**
 * Checks if collection is not more than maxumim size set
 * @returns {boolean}
 */
function collectionIsFull() {
  return getGeneratedBullshitsCollection().length >= MAX_GENERATED_BULLSHIT_COLLECTION;
}

/**
 * Checks if some text is not stored in database yet
 * @param {String} bullshit
 * @returns {boolean}
 */
function bullshitIsUnique(bullshit) {
  var coll = getBullshitCollection(),
    sameBullshit = coll.find({text: bullshit});
  return sameBullshit.length === 0;
}

/**
 * Checks if text is not more than maximum length set
 * @param {String} bullshit
 * @returns {boolean}
 */
function bullshitIsShortEnough(bullshit) {
  return bullshit.length < MAX_BULLSHIT_LENGTH;
}

function isValidByStopword(bullshit, stopWord, maxNumber) {
  var regexp = new RegExp(stopWord, 'ig');
  var matches = bullshit.match(regexp);
  return !matches || matches.length <= maxNumber;
}

function hasBullshitNotTooMuchStopwords(bullshit) {
  return settings.stopWords.reduce(function (isBullshitCurrentlyValid, stopWordConfig) {
    if (isBullshitCurrentlyValid) {
      var stopWord = stopWordConfig[0];
      var maxNumber = stopWordConfig[1];
      isBullshitCurrentlyValid = isValidByStopword(bullshit, stopWord, maxNumber);
    }
    return isBullshitCurrentlyValid;
  }, true);
}


/**
 * Performs two checks for text: uniqueness and length
 * @param {String} bullshit
 * @returns {boolean}
 */
function bullshitIsValid(bullshit, isOrigin) {
  var isValidByStopwords = isOrigin || hasBullshitNotTooMuchStopwords(bullshit);
  return bullshitIsShortEnough(bullshit) && isValidByStopwords && bullshitIsUnique(bullshit);
}

/* ----------------------- */

/**
 * Returns saved collection
 * @returns {Object}
 */
function getBullshitCollection() {
  return db.getCollection('bullshit') || db.addCollection('bullshit');
}

/**
 * Saves to database the received text (if it is possible)
 * @param {String} bullshit
 * @param {Boolean} [isOrigin] true if this is original phrase, not merged
 * @returns {boolean}
 */
function saveBullshit(bullshit, isOrigin) {
  var wasSaved = false,
    collection = getBullshitCollection();

  if (bullshitIsValid(bullshit, isOrigin)) {
    if(!isOrigin && collectionIsFull()) {
      collection.remove(utils.getRandomArrayElement(getGeneratedBullshitsCollection()));
    }
    collection.insert({
      origin: !!isOrigin,
      text: bullshit
    });
    db.saveDatabase();
    wasSaved = true;
  }
  return wasSaved;
}

/**
 * Removes generated phrases, leaving original ones intact
 */
function cleanup() {
  getBullshitCollection().removeWhere({origin: false});
  db.saveDatabase();
}

function getGeneratedBullshitsCollection() {
  return getBullshitCollection().find({origin: false});
}

/**
 * Returns items under received conditions
 * @param {Object} conditionsObject, {fieldName: requiredFieldValue}
 * @returns {Array}
 */
function findBullshits(conditionsObject) {
  Validate.findBullshits.input.apply(null, arguments);
  var result = getBullshitCollection().find(conditionsObject);
  Validate.findBullshits.output(result);
  return result;
}

/**
 * Returns array of objects which text contains received word
 * (with some additional conditions)
 * @param {String} word
 * @returns {Array}
 */
function getBullshitsContainingWord(word) {
  // TODO: make sure about word searching details.
  // Consider searching "word" and "word, ..." to more contextual search
  var coll = getBullshitCollection(),
    clearedWord = word.replace(/\(\)\[\]/, ''),
    regexpText = "(.*[\\s-,]|^)"+ clearedWord + "([\\s,-].*|$)";
  return coll.find({'text': {'$regex': [regexpText, 'i']}});
}

/**
 * Returns random item from database
 * @returns {String}
 */
function getRandomBullshit() {
  var randomBullshit = utils.getRandomArrayElement(getBullshitCollection().data);
  return randomBullshit && randomBullshit.text || "I'm feeling like Jon Snow now.";
}


module.exports = {
  cleanup: cleanup,
  findBullshits: findBullshits,
  getRandomBullshit: getRandomBullshit,
  saveBullshit: saveBullshit,
  getBullshitsContainingWord: getBullshitsContainingWord
};
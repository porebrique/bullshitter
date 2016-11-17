var loki = require('lokijs'),
    db = new loki('db_suggestions.json');

db.loadDatabase();

const MAX_SUGGESTIONS_AMOUNT = 50;
const MAX_SUGGESTION_URL_LENGTH = 200;


function getSuggestionsCollection() {
  return db.getCollection('suggestion') || db.addCollection('suggestion');
}


function addSuggestion(sugg) {
  var col = getSuggestionsCollection(),
      result;
  if (!sugg.url) {
    result = 'wrong';
  } else if(col.data.length >= MAX_SUGGESTIONS_AMOUNT) {
    result = 'full';
  } else if (!suggestionIsUnique(sugg.url)) {
    result = 'duplicate';
  } else if (sugg.url.length > MAX_SUGGESTION_URL_LENGTH) {
    result = 'long';
  } else {
    col.insert({
      user: sugg.user,
      url: sugg.url
    });
    db.saveDatabase();
    result = 'saved';
  }
  return result;
}

function getSuggestions(sugg) {
  var col = getSuggestionsCollection(),
      first5 = col.data.slice(0, 5);
  col.remove(first5);
  db.saveDatabase();
  return first5;
}


function suggestionIsUnique(url) {
  var coll = getSuggestionsCollection(),
      sameSuggestions = coll.find({url: url});
  return sameSuggestions.length === 0;
}


module.exports = {
  addSuggestion: addSuggestion,
  getSuggestions: getSuggestions
};
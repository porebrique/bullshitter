
var fakeDB = [
  {text: 'one two three', origin: true},
  {text: 'four two five', origin: true},
  {text: 'one two five', origin: false}
];

var fakeLokiCollection ={
  find: function (conditions) {
    var result = [].concat(fakeDB);
    Object.keys(conditions).map(function (conditionName) {
      result = result.filter(function (item) {
        return item[conditionName] === conditions[conditionName];
      });
    });
    return result;
  }
};

var lokiMock = function() {
  this.getCollection = function () {
    return fakeLokiCollection
  };
  this.loadDatabase = function () {};
};

module.exports = {
  loki: lokiMock
};
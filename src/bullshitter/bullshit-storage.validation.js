var Assert = require('assert');

module.exports = {
  findBullshits: {
    input: function (conditionsObject){
      Assert(typeof conditionsObject === 'object');
      Object.keys(conditionsObject).map(function (conditionKey) {
        Assert(typeof conditionsObject[conditionKey] !== 'undefined');
      });
    },
    output: function (output) {
      Assert(Array.isArray(output));
    }
  }
};
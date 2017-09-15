var proxyquire =  require('proxyquire');
var mocks = require('./mocks/bullshit-storage.mocks.js');

var storage = proxyquire('../../src/bullshitter/storage/bullshit-storage.js', {
  'lokijs': mocks.loki
});

describe('Bullshitter Storage', function () {

  it('with (findBullshits) returns filtered collection', function(){
    var origins = storage.findBullshits({origin: true}),
        bullshits = storage.findBullshits({origin: false});
    expect(origins.length).toBe(2);
    expect(bullshits.length).toBe(1);
  });


});


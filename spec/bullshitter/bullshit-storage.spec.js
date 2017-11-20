import storage from '../../src/bullshitter/storage/bullshit-storage.js';

describe('Bullshitter Storage', function () {
  // Mocking Loki with helpers/Mocker is not always easy because storage returns DB when imported,
  // not from methods. Maybe I should wrap this in a method somehow

  // TODO: rewrite and enable after reimplementing Storage
  // there are lot of local functions that are hard to mock. They should be class' methods or whatever
  xit('with (findBullshits) returns filtered collection', function(){
    var origins = storage.findBullshits({origin: true}),
        bullshits = storage.findBullshits({origin: false});
    expect(origins.length).toBe(2);
    expect(bullshits.length).toBe(1);
  });


});


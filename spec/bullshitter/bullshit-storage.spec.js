var bullshitStorage = require('../../src/bullshitter/bullshit-storage.js');
var loki = require('lokijs');


// ACHTUNG! Tests destroy real database, so enable carefully
xdescribe('Bullshitter', function () {
  var getStorageBackup,
      storeMock = [
        {text: 'one two three'},
        {text: 'four five one'},
        {text: 'lol kek lil'}
      ];

  beforeEach(function() {
    //getStorageBackup = bullshitStorage.getStorage;
  });

  afterEach(function () {
    //bullshitStorage.getStorage = getStorageBackup;
  });

  it('returns bullshit collection', function(){
    var collection = bullshitStorage.getBullshitCollection();
    //console.log('collection in test:', typeof  collection);
    expect(collection).toBeTruthy();
    expect(collection.name).toBe('bullshit');
  });


  describe('bullshit saving', function() {
    // TODO: mock real db somehow, since real collections got rewrited
    var bullshit = 'some bullshit';

    it('executes for unique bullshit', function(){
      var wasSaved = bullshitStorage.saveBullshit(bullshit);
      expect(wasSaved).toBe(true);
    });

    it('does not execute for non-unique bullshit', function(){
      var wasSaved = bullshitStorage.saveBullshit(bullshit);
      expect(wasSaved).toBe(false);
    });
  });

  describe('getStorage() method', function (){
    it('exists', function () {
      expect(typeof bullshitStorage.getStorage).toBe('function');
    });

    it('returns smth', function () {
      var storage = bullshitStorage.getStorage();

      //console.log('storage is:', storage);

      //expect(1).toBe(2);
    });


  });


});


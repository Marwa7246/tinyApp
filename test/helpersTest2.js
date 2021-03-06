const { assert } = require('chai');


const {specificUrlToSpecificUser, searchUrl, urlsForUserId} = require('../helper');


const testUrlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userId: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userId: 'QJ76lT' },
  fJHT6T: { longURL: 'https://www.cnn.com', userId: 'aJ48lW' }
};

describe('searchUrl', function() {
  it('should return the url object for given shortURL', function() {
    const url = searchUrl(testUrlDatabase, 'b6UTxQ');
    const expectedOutput = { b6UTxQ: { longURL: 'https://www.tsn.ca', userId: 'aJ48lW' } };
    assert.deepEqual(url, expectedOutput);

  });
  it('should return an empty object for an invalid shorURL', function() {
    const url = searchUrl(testUrlDatabase, 'b6UTDD');
    assert.deepEqual(url, {});
  });
});

describe('urlsForUserId', function() {
  it('should return a list of Url pair (short and long ) for a given user', function() {
    const url = urlsForUserId(testUrlDatabase, 'aJ48lW');
    const expectedOutput = {
      b6UTxQ: { longURL: 'https://www.tsn.ca', userId: 'aJ48lW' },
      fJHT6T: { longURL: 'https://www.cnn.com', userId: 'aJ48lW' }
    };
    assert.deepEqual(url, expectedOutput);

  });
  it('should return an empty object for an invalid userId', function() {
    const url = urlsForUserId(testUrlDatabase, 'aJ48lqq');
    const expectedOutput = {};
    assert.deepEqual(url, expectedOutput);
  });
});


describe('specificUrlToSpecificUser', function() {
  it('should return an error of (Register or login first!) if no user is logged in', function() {
    const result = specificUrlToSpecificUser('', 'b6UTxQ',testUrlDatabase);
    const expectedOutput = 'Register or login first!';
    assert.strictEqual(result.error, expectedOutput);
  });

  it('should return an error of (Bad request! You don\'t have access to this URL!) if the requested shortURL is not in the urlDtabase of the looged in user', function() {
    const result = specificUrlToSpecificUser('QJ76lT', 'b6UTxQ',testUrlDatabase);
    const expectedOutput = 'Bad request! You don\'t have access to this URL!';
    assert.strictEqual(result.error, expectedOutput);
  });

  it('should return no error if the looged in user has access to the requested url. The url pair is returned', function() {
    const result = specificUrlToSpecificUser('aJ48lW', 'b6UTxQ',testUrlDatabase);
    const expectedOutput = { b6UTxQ: { longURL: 'https://www.tsn.ca', userId: 'aJ48lW' },  error: '' };
    assert.deepEqual(result, expectedOutput);
    //assert.strictEqual(result.error, '');

  });

});

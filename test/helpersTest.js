const { assert } = require('chai');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);


const {getUserByEmail,searchUser, userAuthentication} = require('../helper');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('hello-world', salt)
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', salt)
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, 'user@example.com');
    const expectedOutput = 'userRandomID';
    assert.strictEqual(user, expectedOutput);

  });
  it('should return false for an invalid email', function() {
    const user = getUserByEmail(testUsers, 'user222@example.com');
    assert.isFalse(user);
  });
});

describe('searchUser', function() {
  it('should return a user with Id', function() {
    const user = searchUser(testUsers, 'user2RandomID');

    const expectedOutput = { id: 'user2RandomID',email: 'user2@example.com', password: bcrypt.hashSync('dishwasher-funk', salt)};
    assert.deepEqual(user, expectedOutput);

  });
  it('should return undefined for an invalid userId', function() {
    const user = searchUser(testUsers, 'user2Random');
    assert.isUndefined(user);
  });
});


describe('userAuthentication', function() {
  it('should return true for a user with valid email and password', function() {
    const result = userAuthentication(testUsers, 'user@example.com','hello-world');
    assert.isTrue(result);

  });
  it('should return false for invalid password', function() {
    const result = userAuthentication(testUsers, 'user2@example.com', 'dishwasher');
    assert.isFalse(result);
  });
  it('should return false for invalid email ', function() {
    const result = userAuthentication(testUsers, 'user2222@example.com', 'dishwasher-funk');
    assert.isFalse(result);
  });
  it('should return false for empty email', function() {
    const result = userAuthentication(testUsers, '', 'dishwasher-funk');
    assert.isFalse(result);
  });
  it('should return false for invalid email or password', function() {
    const result = userAuthentication(testUsers, 'user2@example.com', '');
    assert.isFalse(result);
  });
});







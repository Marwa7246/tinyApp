const bcrypt = require('bcrypt');
//const saltRounds = 10;
//const salt = bcrypt.genSaltSync(saltRounds);

/////////////////////////////// HELPER FUNCTIONS///////////////////////////
//1- A function to generate a random shortURL Id
const genetateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};


//2- A function to find a user from the user database using the user_id cookie
const searchUser = function(users, userId) {
  return users[userId];
};

// 3- A function to determine if there is a user related to the given email or not and return this user
const userExist = function(users, requestedEmail) {
  for (const id in users) {
    if (users[id].email === requestedEmail) {
      return id;
    }
  }
  return false;
};

// 4- A function to determine if the email and password match the userdatabase
const userAuthentication = function(users,requestedEmail, requestedPassword) {
  const id = userExist(users, requestedEmail);
  if (id) {      /////// email found, check the password next

    if (bcrypt.compareSync(requestedPassword, users[id].password)) {
      
      ////great success. GOOD password
      // will render the user(requestedEmail, requestedPassword)
      return true;
    } else {
      //////////////// great failure.BAD password
      // res.send("Bad Email/password combination...")
      return false;
    }
  } else {
    //////////////////// Ultimate failure. BAD email. Don't care about the password
    // res.send("Bad Email/password combination...")

    return false;
  }
};


//5- A function that Return the url pair (short and long) for a given shortURL
const searchUrl = function(urlDatabase, shortURL) {
  let longURL = '';
  if (urlDatabase[shortURL]) {
    longURL =  urlDatabase[shortURL].longURL;
  }
  return {shortURL, longURL };
};

//6- A function to return a list of Url pair (short and long ) for a given user
const urlsForUserId = function(urlDatabase, requestedUserId) {
  let urlUser = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === requestedUserId) {
      urlUser[shortURL] = {shortURL, longURL: urlDatabase[shortURL].longURL};
    }
  }
  return urlUser;
};

//7- A function to determine the authentication of a user to acccess a specific url (either there is a uer )
const specificUrlToSpecificUser = function(userId, shortURL, urlDatabase) {
  const urls = urlsForUserId(urlDatabase, userId);
  const url = searchUrl(urls, shortURL);
  let error = '';
  if (!url.longURL) {
    if (!userId) {
      error = 'Register or login first!';
    } else {
      error = 'Bad request! You don\'t have access to this URL!';
    }
  }
  return {url, error};
  
};

/////////////////END OF HELPERS FUNCTIONS///////////////////////////////////





module.exports = {
  genetateRandomString,
  specificUrlToSpecificUser,
  searchUser,
  userExist,
  userAuthentication,
  searchUrl,
  urlsForUserId
};
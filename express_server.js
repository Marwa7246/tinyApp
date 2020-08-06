 
const {searchUser, genetateRandomString,specificUrlToSpecificUser, userExist, userAuthentication,searchUrl,urlsForUserId} = require('./helper');


const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());


const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "QJ76lT": {
    id: "QJ76lT",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "QJ76lT" },
  fJHT6T: { longURL: "https://www.cnn.com", userId: "aJ48lW" }
};

/*
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
*/
/////////////////END OF HELPERS FUNCTIONS///////////////////////////////////


//////////////////////ROUTEs/////////////////////////////

//1- Get all the available urls in the database object
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = searchUser(users, userId);
  const urls = urlsForUserId(urlDatabase, userId);

  let error = '';
  if (!userId) {
    error = 'Register or login first!';
  }
  let templateVars = { urls, user, error};
  res.render('urls_index', templateVars);

});


//2- get a form to add a new URL
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect('/login');
  } else {
    const user = searchUser(users, userId);
    let templateVars = { user };
    res.render('urls_new', templateVars);
  }
});

//3- Post a NEW longURL and submit it in the form, then redirected to the page showing the new longURL along the corresponding shortURL (SHOULD BE COMBINED WITH THE PRIVOUS ROUTE TO ADD A NEW url)
app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  const longURL = req.body.longURL;
  const newId = genetateRandomString();
  urlDatabase[newId] = {longURL, userId};
  res.redirect(`/urls/${newId}`);
});

//4- Get to a web page where a specific requested shortURL is shown
app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const user = searchUser(users, userId);
  const shortURL = req.params.shortURL;
  const urls = urlsForUserId(urlDatabase, userId);
  const url = searchUrl(urls, shortURL);
  let error = '';
  if (!url.longURL) {
    if (!userId) {
      error = 'Register or login first!';
    } else {
      error = 'Bad request! This url does not exist!';
    }
  }
  let templateVars = { url, user, error};
  res.render('urls_show', templateVars);
});



//5- Get to longURL real web page after clicking on the shortURL (in the url_show page) (redirect)
app.get(`/u/:shortURL`, (req, res) => {
  const redirectShortUrl = req.params.shortURL;

  //6- Render a 404 error page if wrong short URL is requested
  if (!urlDatabase[redirectShortUrl]) {
    res.statusCode = 404;
    res.render('404');
  } else {
    const redirectLongUrl = urlDatabase[redirectShortUrl].longURL;
    res.redirect(redirectLongUrl);
  }
});

//7- Delete a URL from the urlDatabase - DELETE(POST)
app.post('/urls/:shortURL/delete', (req, res) =>{
  //extract the id from the url
  //req.params
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;

  const resultSearchObj = specificUrlToSpecificUser(userId, shortURL, urlDatabase);

  if (!resultSearchObj.error) {
  //   //delete it from the database
    delete urlDatabase[shortURL];
  }
  // //redirect to /urls
  res.redirect('/urls');
});

//8- Update a URL in the urlDatabase - UPDATE(POST)
//8-1- show the requested url page after hitting edit in the database page
app.get('/urls/:shortURL/update', (req, res) =>{
  //extract the id from the url
  //req.params
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const user = searchUser(users, userId);
  
  const resultSearchObj = specificUrlToSpecificUser(userId, shortURL, urlDatabase);
  const url = resultSearchObj.url;
  const error = resultSearchObj.error;

  let templateVars = { url, user, error};
  res.render('urls_show', templateVars);
});

//8-2- POST the new longURL value after filling the form of update the longURL
app.post('/urls/:shortURL', (req, res) =>{
  //extract the shortURL from the url req.params
  //extract the longURL from req.body ONLY if the user has this url in this database
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  
  const resultSearchObj = specificUrlToSpecificUser(userId, shortURL, urlDatabase);

  if (!resultSearchObj.error) {
    //Upadate the url in the database
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect('/urls');
});


//9-POST a route to logout in the _header partial file
app.post('/logout', (req, res) => {
  delete req.session.user_id;
  res.redirect('urls');
});


//10- GET a route to a page with a registration form (GET) READ
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const user = searchUser(users, userId);
  const error = '';
  let templateVars = {user, error};
  res.render('register', templateVars);
});

//11- POST a route to create a new user
app.post('/register',(req, res) => {

  if (!req.body.email || !req.body.password || userExist(users, req.body.email)) {
    let error = 'Error-Bad request. ';
    error += (userExist(users, req.body.email)) ? 'Email already exists!' : 'Email/password cannot be empty!';

    res.statusCode = 400;
    const userId = req.session.user_id;
    const user = searchUser(users, userId);
    let templateVars = { user, error};
    res.render("register", templateVars);

  } else {
    const newId = genetateRandomString();
    const newUserPassword = bcrypt.hashSync(req.body.password, salt);
    const newUser = {id: newId, email: req.body.email, password: newUserPassword};
    users[newId] = newUser;
    req.session.user_id = newId;
    res.redirect('urls');
  }
});

//12- GET a route to a page contaning a login form (email and password) (login form) GET(READ)
app.get('/login', (req, res) => {
  const error = '';
  const user = '';
  let templateVars = {user, error};
  res.render('login', templateVars);
});
////////////////////////////////////////////////////////////////////////////////////////////////
//13- POST a route to login to an existing user (POST)
app.post('/login',(req, res) => {
  const requestedEmail = req.body.email;
  const requestedPassword = req.body.password;

  if (userAuthentication(users,requestedEmail, requestedPassword)) {
    const userId = userExist(users, requestedEmail);
    req.session.user_id = userId;
    res.redirect('urls');

  } else {
    const error = 'Error Invalid email/password combination';
    res.statusCode = 403;
    const user = '';
    let templateVars = { user, error};
    res.render("login", templateVars);
  }
});
//////////////////////////////////////////////////////////////////////////////////////////



//14- get an error page if a non excisting page was requested
app.get(`*`, (req, res) => {
  res.statusCode = 404;
  res.render('404');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


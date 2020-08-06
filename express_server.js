 
const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

//Generate a random shortURL Id
const genetateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

const users = {
  "u8qwvt": {
    id: "u8qwvt",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "u5qaf3": {
    id: "u5qaf3",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
//find a user from the user database using the user_id cookie
const searchUser = function(users, userId) {
  return users[userId];
};

 
const userExist = function(users, requestedEmail) {
  for (const id in users) {
    if (users[id].email === requestedEmail) {
      return id;
    }
  }
  return false;
};


const userAuthentication = function(users,requestedEmail, requestedPassword) {
  const id = userExist(users, requestedEmail);
  if (id) {      /////// email found, check the password next

    if (users[id].password === requestedPassword) {
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



//Get all the available urls in the database object
app.get('/urls', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = searchUser(users, userId);
  let templateVars = { urls: urlDatabase, user};
  //console.log(templateVars);
  res.render('urls_index', templateVars);
});


//get a form to add a new URL
app.get('/urls/new', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = searchUser(users, userId);
  let templateVars = { user};
  res.render('urls_new', templateVars);
});

//Get to a web page where a specific requested shortURL is shown
app.get('/urls/:shortURL', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = searchUser(users, userId);
  const url = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  let templateVars = { url, user};
  res.render('urls_show', templateVars);
});

//Post a new longURL and submit it in the form, then redirected to the page showing the new longURL along the corresponding shortURL
app.post('/urls', (req, res) => {
  const newUrl = req.body.longURL;
  const newId = genetateRandomString();
  urlDatabase[newId] = newUrl;
  res.redirect(`/urls/${newId}`);
});

//Get to longURL page after requesting the shortURL (redirect)
app.get(`/u/:shortURL`, (req, res) => {
  const redirectShortUrl = req.params.shortURL;

  //Render a 404 error page if wrong short URL is requested
  if (!urlDatabase[redirectShortUrl]) {
    res.statusCode = 404;
    res.render('404');
  } else {
    const redirectLongUrl = urlDatabase[redirectShortUrl];
    res.redirect(redirectLongUrl);
  }
});

//Delete a URL from the urlDatabase - DELETE(POST)
app.post('/urls/:shortURL/delete', (req, res) =>{
  //extract the id from the url
  //req.params
  const ShortUrl = req.params.shortURL;
  
  //delete it from the database
  delete urlDatabase[ShortUrl];

  //redirect to /urls
  res.redirect('/urls');
});

//Update a URL in the urlDatabase - UPDATE(POST)
//1- show the requested url page after hitting edit in the database page
app.post('/urls/:shortURL/update', (req, res) =>{
  //extract the id from the url
  //req.params
  const userId = req.cookies["user_id"];
  const user = searchUser(users, userId);
  const url = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  let templateVars = { url, user};
  res.render('urls_show', templateVars);
});

//2- POST the new longURL value after filling the form of update the longURL
app.post('/urls/:shortURL', (req, res) =>{
  //extract the shortURL from the url req.params
  //extract the longURL from req.body
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});


//POST a route to logout in the _header partial file
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('urls');
});


//GET a route to a page with a registration form (GET) READ
app.get('/register', (req, res) => {
  const userId = req.cookies["user_id"];
  const user = searchUser(users, userId);
  const error = '';
  let templateVars = {user, error};
  res.render('register', templateVars);
});

//POST a route to create a new user
app.post('/register',(req, res) => {

  if (!req.body.email || !req.body.password || userExist(users, req.body.email)) {
    let error = 'Error-Bad request. ';
    error += (userExist(users, req.body.email)) ? 'Email already exists!' : 'Email/password cannot be empty!';

    res.statusCode = 400;
    const userId = req.cookies["user_id"];
    const user = searchUser(users, userId);
    let templateVars = { user, error};
    res.render("register", templateVars);

  } else {
    const newId = genetateRandomString();
    const newUser = {id: newId, email: req.body.email, password: req.body.password};
    users[newId] = newUser;
    res.cookie('user_id', newId);
    res.redirect('urls');
  }
});

//GET a route to a page contaning a form login (email and password) (login form) GET(READ)
app.get('/login', (req, res) => {
  const error = '';
  const user = '';
  let templateVars = {user, error};
  res.render('login', templateVars);
});
////////////////////////////////////////////////////////////////////////////////////////////////
//POST a route to login to an existing user (POST)
app.post('/login',(req, res) => {
  const requestedEmail = req.body.email;
  const requestedPassword = req.body.password;

  if (userAuthentication(users,requestedEmail, requestedPassword)) {
    const userId = userExist(users, requestedEmail);
    res.cookie('user_id', userId);
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



//get an error page if a non excisting page was requested
app.get(`*`, (req, res) => {
  res.statusCode = 404;
  res.render('404');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

 
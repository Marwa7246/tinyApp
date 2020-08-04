 
const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Generate a random shortURL Id
const genetateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Get the home page
app.get('/', (req, res) => {
  res.send('Hello!');
});


//Get all the available urls in the database object
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


//get a form to add a new URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//Get to a web page where a specific requested shortURL is shown
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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
  //re.params
  const ShortUrl = req.params.shortURL;
  
  //delete it from the database
  delete urlDatabase[ShortUrl];

  //redirect to /urls
  res.redirect('/urls');
});

app.get(`*`, (req, res) => {
  res.statusCode = 404;
  res.render('404');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


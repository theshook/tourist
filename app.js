const express         = require('express');
const app             = express();
const bodyParser 	    = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));


app.get('/', (req, res) => {
  res.render('home', {pageTitle: 'Abra Travel Guide'});
});

app.get('/places-to-go', (req, res) => {
  res.render('places-to-go', {pageTitle: 'places-to-go'});
});

app.get('/things-to-do', (req, res) => {
  res.render('things-to-do', {pageTitle: 'things-to-do'});
});

app.get('/plan-your-trip', (req, res) => {
  res.render('plan-your-trip', {pageTitle: 'plan-your-trip'});
});

app.get('/login', (req,res) => {
  res.render('Login/login', {pageTitle: 'Login'});
});

app.get('/register', (req,res) => {
  res.render('Register/register', {pageTitle: 'Login'});
});

const port = process.env.PORT || 8000;

app.listen(port, function(){
  console.log(`Server is running on ${port}`)
});
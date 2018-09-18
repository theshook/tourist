const express              = require('express');
const router               = express.Router();
const passport             = require('passport');

// Handle incoming GET requests to /barangay
router.get('/', (req, res) => {
  if(req.user) {
    res.redirect('/');
  } else {
     res.render('Client/Login/Login', {pageTitle: 'Login Panel', page: 'Login', message: req.flash('loginMessage')});
  }
});

// process the login form
router.post('/', passport.authenticate('local-login', {
  successRedirect : '/', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}),
function(req, res) {
  console.log("hello");

  if (req.body.remember) {
    req.session.cookie.maxAge = 1000 * 60 * 3;
  } else {
    req.session.cookie.expires = false;
  }
res.redirect('/login');
});

module.exports = router;
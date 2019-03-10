const express = require('express');
const router = express.Router();
const passport = require('passport');


// Handle incoming GET requests to /barangay
router.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/admin');
  } else {
    res.render('Admin/template', {
      pageTitle: 'Login Panel',
      page: 'Login',
      success: undefined,
      error: undefined,
      message: req.flash('loginMessage')
    })
  }
});

// process the login form
router.post('/', passport.authenticate('local-login', {
  successRedirect: '/admin', // redirect to the secure profile section
  failureRedirect: '/admin/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}),
  function (req, res) {
    console.log("hello");

    if (req.body.remember) {
      req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
    res.redirect('/admin/login');
  });

module.exports = router;
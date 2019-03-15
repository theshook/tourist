const express = require('express');
const router = express.Router();
const passport = require('passport');
const db = require("../db.js");
const { log_file_query } = require("./../controllers/Client/Helpers/QueryHelpers");
var moment = require("moment");
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
router.post('/',
  passport.authenticate('local-login', {
    failureRedirect: '/admin/login',
    failureFlash: true
  }), (req, res) => {
    let { user_no } = req.user;

    db.query(`SELECT user_lname, user_fname, user_email, ut_no FROM users WHERE user_no = ${user_no}`, (err, rows) => {
      if (err) { throw err; }

      let { user_lname, user_fname, user_email } = rows[0];
      let name = `${user_fname} ${user_lname}`;

      db.query(log_file_query(),
        [name, user_email, 'Login', 'Admin Login', moment().format()],
        (err, rows) => {
          if (err) { throw err; }
          // res.redirect('/admin');
        })
    });

    if (req.body.remember) {
      req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
    res.redirect('/admin/login')
  });

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require("../db.js");
const { log_file_query } = require("../controllers/Client/Helpers/QueryHelpers");
var moment = require("moment");
// Handle incoming GET requests to /barangay
router.get('/', (req, res) => {
  let { user_fname, user_lname, user_email } = req.user;
  let name = `${user_fname} ${user_lname}`;

  db.query(log_file_query(),
    [name, user_email, 'Logout', 'Admin Logout', moment().format()],
    (err, rows) => {
      req.logout();
      res.redirect('/admin');
    })
});

router.get('/client', (req, res) => {
  let { user_fname, user_lname, user_email } = req.user;
  let name = `${user_fname} ${user_lname}`;

  db.query(log_file_query(),
    [name, user_email, 'Logout', 'Client Logout', moment().format()],
    (err, rows) => {
      req.logout();
      res.redirect('/');
    })
});

module.exports = router;
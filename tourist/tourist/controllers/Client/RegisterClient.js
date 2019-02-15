const express           = require('express');
const router            = express.Router();
const db                = require('../../db.js');
const bcrypt            = require('bcrypt-nodejs');

exports.register_page = (req, res) => {
  res.render("Client/Register/register", { pageTitle: "Login" });
}

exports.users_create_client = (req, res) => {
  console.log(req.body)
  let data = {
    fname: req.body.fname,
    mname: req.body.mname,
    lname: req.body.lname,
    email: req.body.email,
    mobile: req.body.mnumber,
    phone: req.body.pnumber,
    username: req.body.email,
    password: bcrypt.hashSync(req.body.password, null, null),
    usertype: 1
  };
  db.query('INSERT INTO users(ut_no, user_lname, user_fname, user_mname, user_email,  user_mobile, user_phone) values(?,?,?,?,?,?,?)', 
  [data.usertype, data.lname, data.fname, data.mname, data.email, data.mobile, data.phone], 
    (err, rows) => {
      console.log(rows)
        db.query('INSERT INTO logins(user_no, login_uname, login_pword) values(?,?,?)',
        [rows.insertId, data.username, data.password ], (error, result) => {
          if(error) {
            throw error;
          } else {
            res.redirect('/login');
          }
        });
      if (err) {
        throw err;
      }
  });
}
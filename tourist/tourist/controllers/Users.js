const express           = require('express');
const router            = express.Router();
const db                = require('../db.js');
const bcrypt            = require('bcrypt-nodejs');

exports.users_get_all = (req, res) => {
  let search_towns = req.query.town_q || null
  let current_page = req.query.page || 1
  let items_per_page = 4
  let start_index = (current_page - 1) * items_per_page

  db.query(`SELECT COUNT(*) as total FROM users INNER JOIN users_type ON users.ut_no=users_type.ut_no WHERE user_inactive=0 AND user_delete=0`, (err, total_items) => {
    if(err){
      throw err;
    }

    let total_pages = Math.ceil(total_items[0].total / items_per_page)
    let towns_q = (search_towns==null) ? null : search_towns

    let query = (towns_q==null) ? 
    `SELECT * FROM users INNER JOIN users_type ON users.ut_no=users_type.ut_no order by user_lname asc LIMIT ?, ?` 
    :
    `SELECT * FROM users INNER JOIN users_type ON users.ut_no=users_type.ut_no
     WHERE user_email=? order by user_lname asc`

    let data = (towns_q==null) ? 
                [start_index, items_per_page] : 
                [towns_q, start_index, items_per_page]
    db.query(query, data, (err, rows) => {
      res.render('Admin/template', {user: req.user, total_pages: total_pages, rows: rows, pageTitle: 'User Panel', page: 'User/User'});
    });
  });
}

exports.users_new = (req, res) => {
  res.render('Admin/template', {user: req.user, pageTitle: 'User Panel', page: 'User/New'});
}

exports.users_create = (req, res) => {
  console.log(req.body)
  let data = {
    fname: req.body.fname,
    mname: req.body.mname,
    lname: req.body.lname,
    email: req.body.email,
    mobile: req.body.mobile,
    phone: req.body.phone,
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, null, null),
    usertype: req.body.usertype
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
            res.redirect('/admin/user');
          }
        });
      if (err) {
        throw err;
      }
  });
}

exports.user_edit = (req, res) => {
  let id = req.params.userId;
  db.query('SELECT user_no, users.ut_no, user_lname, user_fname, user_mname, user_email, user_mobile, user_phone FROM users INNER JOIN users_type ON users.ut_no = users_type.ut_no WHERE user_no = ?', 
  [id], 
  (err, rows) => {
    if(err) {
      throw err;
    } else {
      console.log(rows[0].ut_no)
      res.render('Admin/template', {user: req.user, row: rows, pageTitle: 'User Panel', page: 'User/Update'});
    }
  });
}

exports.user_update = (req, res) => {
  let data = {
    fname: req.body.fname,
    mname: req.body.mname,
    lname: req.body.lname,
    email: req.body.email,
    mobile: req.body.mobile,
    phone: req.body.phone,
    usertype: req.body.usertype,
    id: req.params.userId
  }
  db.query('UPDATE users SET user_fname=?, user_mname=?, user_lname=?, user_email=?, user_mobile=?, user_phone=?, ut_no=? WHERE user_no=?', 
  [data.fname, data.mname, data.lname, data.email, data.mobile, data.phone, data.usertype, data.id],
  (err, row) => {
    if(err) {
      throw err;
    } else {
      res.redirect('/admin/user');
    }
  })
}
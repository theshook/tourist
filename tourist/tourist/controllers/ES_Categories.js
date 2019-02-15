const mysql = require('mysql');
const db = require('../db.js');
var moment = require('moment');

exports.categories_get_all = (req, res) => {
  res.render('Admin/template', { user: req.user, pageTitle: 'Category Panel', page: 'ES_Category/ES_Category' });
}

exports.establishments_new = (req, res) => {
  res.render('Admin/template', { user: req.user, pageTitle: 'Category Panel', page: 'ES_Category/E_New' });
}

exports.establishments_create = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let data = req.body.ec;
  let user = req.user.user_no;
  console.log(date, data, user)
  // db.query('INSERT INTO establistments_cateogry (ec_name, ec_encode, ec_encode_date) values (?, ?, ?)',[], (err, req) => {
  res.redirect('/admin/es-category');
  // });
}
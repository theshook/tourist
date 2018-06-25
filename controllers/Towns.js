const express           = require('express');
const router            = express.Router();
const mysql             = require('mysql');
const db                = require('../db.js');

exports.towns_get_all = (req, res) => {
  db.query('SELECT * FROM towns order by town_name asc', (err, rows) => {
    if (err) {
      throw err;
    }
      res.render('Admin/template', {rows: rows, pageTitle: 'Town Panel', page: 'Town/Town'});
  });
}

exports.towns_new = (req, res) => {
  res.render('Admin/template', {pageTitle: 'Town Panel', page: 'Town/New'});
}

exports.towns_create = (req, res) => {
  let data = {
    town: req.body.town_name,
    zipcode: req.body.zipcode,
    istown: req.body.city
  }
  db.query('INSERT INTO towns(town_name, town_zipcode, town_iscity) values(?,?,?)', 
  [data.town, data.zipcode, data.istown], 
  (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.redirect('/admin/town');
    }
  });
}

exports.towns_edit = (req, res) => {
  let id = req.params.townId;
  db.query('SELECT town_no, town_name, town_zipcode, town_iscity from towns where town_no = ?', 
  [id], 
  (err, row) => {
    if (err) {
      throw err;
    } else {
      res.render('Admin/template', {row: row, pageTitle: 'Town Panel', page: 'Town/Update'});
    }
  });
}

exports.towns_update = (req, res) => {
  let data = {
    town: req.body.town_name,
    zipcode: req.body.zipcode,
    istown: req.body.city,
    id: req.params.townId
  }
  db.query('UPDATE towns SET town_name=?, town_zipcode=?, town_iscity=? WHERE town_no=?',
  [data.town, data.zipcode, data.istown, data.id],
  (err, row) => {
    if(err) {
      throw err;
    } else {
      res.redirect('/admin/town');
    }
  })
}

exports.towns_delete = (req, res) => {
  db.query('DELETE FROM towns where town_no=?', [req.params.townId], (err, row) => {
    if (err) {
      throw err;
    } else {
      res.redirect('/admin/town');
    }
  })
}
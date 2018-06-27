const mysql             = require('mysql');
const db                = require('../db.js');

exports.barangays_get_all = (req, res) => {
  db.query('SELECT bar_no, bar_name, town_name FROM barangays INNER JOIN towns ON barangays.town_no = towns.town_no order by bar_name asc', (err, rows) => {
    if (err) {
      throw err;
    }
      res.render('Admin/template', {rows: rows, pageTitle: 'Barangay Panel', page: 'Barangay/Barangay'});
  });
}

exports.barangays_new = (req, res) => {
  db.query('SELECT town_no, town_name FROM towns order by town_name asc', (err, rows) => {
    if (err) {
      throw err;
    }
      res.render('Admin/template', {data: rows, pageTitle: 'Barangay Panel', page: 'Barangay/New'});
  });
}

exports.barangays_create = (req, res) => {
  let data = {
    town: req.body.town_no,
    barangay: req.body.barangay_name
  }
  db.query('INSERT INTO barangays (town_no, bar_name) values(?,?)', 
  [data.town, data.barangay], 
  (err, rows) => {
    if (err) {
      throw err;
    } else {
      res.redirect('/admin/barangay');
    }
  });
}

exports.barangays_edit = (req, res) => {
  let id = req.params.barId;
  db.query('SELECT barangays.town_no, bar_no, bar_name, town_name FROM barangays INNER JOIN towns ON barangays.town_no = towns.town_no where bar_no = ?', 
  [id], 
  (err, row) => {
    db.query('SELECT town_no, town_name FROM towns order by town_name asc', (err, data) => {
      if (err) {
        throw err;
      } else {
        res.render('Admin/template', {row: row, data: data, pageTitle: 'Barangay Panel', page: 'Barangay/Update'});
      }
    });
  });
}

exports.barangays_update = (req, res) => {
  let data = {
    town_no: req.body.town_no,
    bar_name: req.body.bar_name,
    id: req.params.barId
  }
  db.query('UPDATE barangays SET bar_name=?, town_no=? where bar_no = ?', [data.bar_name, data.town_no, data.id],
  (err, row) => {
    if(err) {
      throw err;
    } else {
      res.redirect('/admin/barangay');
    }
  })
}

exports.barangays_delete = (req, res) => {
  db.query('DELETE FROM barangays where bar_no=?', [req.params.barId], (err, row) => {
    if (err) {
      throw err;
    } else {
      res.redirect('/admin/barangay');
    }
  })
}
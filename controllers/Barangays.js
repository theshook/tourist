const moment            = require('moment');
const db                = require('../db.js');

exports.barangays_get_all = (req, res) => {
  let search_barangay = req.query.barangay_q || null
  let current_page = req.query.page || 1
  let items_per_page = 4
  let start_index = (current_page - 1) * items_per_page

  db.query('SELECT count(bar_no) as total FROM barangays', (err, total_items) => {
    if(err){
      throw err;
    }

    let total_pages = Math.ceil(total_items[0].total / items_per_page)
    let barangay_q = (search_barangay==null) ? null : search_barangay
    let query = (barangay_q==null) ? 
    `SELECT * FROM barangays INNER JOIN towns ON barangays.town_no = towns.town_no 
    WHERE bar_inactive=0 
    AND bar_delete=0 
    order by bar_name asc 
    LIMIT ?, ?` 
    :
    `SELECT bar_no, bar_name, town_name 
    FROM barangays INNER JOIN towns ON barangays.town_no = towns.town_no 
    WHERE bar_name LIKE ? OR town_name LIKE ? AND (bar_inactive=0 AND bar_delete=0) order by bar_name asc 
    LIMIT ?, ?`

    let data = (barangay_q==null) ? 
                [start_index, items_per_page] : 
                [barangay_q+'%', barangay_q+'%', start_index, items_per_page]

    db.query(query, data, (err, rows) => {
    if(err){
      throw err;
    }
    res.render('Admin/template', {user: req.user, total_pages: total_pages, rows: rows, pageTitle: 'Barangay Panel', page: 'Barangay/Barangay'});
    });
  });
}

exports.barangays_new = (req, res) => {
  db.query('SELECT town_no, town_name FROM towns WHERE town_inactive=0 AND town_delete=0 order by town_name asc', (err, rows) => {
    if (err) {
      throw err;
    }
      res.render('Admin/template', {user: req.user, data: rows, pageTitle: 'Barangay Panel', page: 'Barangay/New'});
  });
}

exports.barangays_create = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let data = {
    town: req.body.town_no,
    barangay: req.body.barangay_name
  }
  db.query('INSERT INTO barangays (town_no, bar_name, bar_encode, bar_encode_date) values(?,?,?,?)', 
  [data.town, data.barangay, user, date], 
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
        res.render('Admin/template', {user: req.user, row: row, data: data, pageTitle: 'Barangay Panel', page: 'Barangay/Update'});
      }
    });
  });
}

exports.barangays_update = (req, res) => {
  let user = req.user.user_no;
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let data = {
    town_no: req.body.town_no,
    bar_name: req.body.bar_name,
    id: req.params.barId
  }
  db.query('UPDATE barangays SET bar_name=?, town_no=?, bar_encode=?, bar_encode_date=? where bar_no = ?', [data.bar_name, data.town_no, user, date, data.id],
  (err, row) => {
    if(err) {
      throw err;
    } else {
      res.redirect('/admin/barangay');
    }
  })
}

exports.barangays_delete = (req, res) => {
  let date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  db.query('UPDATE barangays SET bar_inactive=1, bar_delete=1, bar_encode=?, bar_encode_date=? WHERE bar_no=?', [user, date, req.params.barId], (err, row) => {
    if (err) {
      throw err;
    } else {
      res.redirect('/admin/barangay');
    }
  })
}
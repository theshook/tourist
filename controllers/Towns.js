const moment = require("moment");
const db = require("../db.js");
let date;

exports.towns_get_all = (req, res) => {
  let search_towns = req.query.town_q || null;
  let current_page = req.query.page || 1;
  let items_per_page = 4;
  let start_index = (current_page - 1) * items_per_page;
  db.query(
    "SELECT count(town_no) as total FROM towns WHERE town_inactive=0 AND town_delete=0",
    (err, total_items) => {
      if (err) {
        throw err;
      }

      let total_pages = Math.ceil(total_items[0].total / items_per_page);
      let towns_q = search_towns == null ? null : search_towns;

      let query =
        towns_q == null
          ? `SELECT * FROM towns 
    WHERE town_inactive=0 
    AND town_delete=0 
    order by town_name asc 
    LIMIT ?, ?`
          : `SELECT * FROM towns 
    WHERE town_zipcode=? OR town_name=? 
    AND (town_inactive=0 AND town_delete=0) 
    order by town_name asc 
    LIMIT ?, ?`;

      let data =
        towns_q == null
          ? [start_index, items_per_page]
          : [towns_q, towns_q, start_index, items_per_page];

      db.query(query, data, (err, rows) => {
        if (err) {
          throw err;
        }
        res.render("Admin/template", {
          user: req.user,
          total_pages: total_pages,
          rows: rows,
          pageTitle: "Town Panel",
          page: "Town/Town"
        });
      });
    }
  );
};

exports.towns_new = (req, res) => {
  res.render("Admin/template", {
    user: req.user,
    pageTitle: "Town Panel",
    page: "Town/New"
  });
};

exports.towns_create = (req, res) => {
  date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let data = {
    town: req.body.town_name,
    zipcode: req.body.zipcode,
    istown: req.body.city
  };
  db.query(
    "INSERT INTO towns(town_name, town_zipcode, town_iscity, town_encode, town_encode_date) values(?,?,?,?,?)",
    [data.town, data.zipcode, data.istown, user, date],
    (err, rows) => {
      if (err) {
        throw err;
      } else {
        res.redirect("/admin/town");
      }
    }
  );
};

exports.towns_edit = (req, res) => {
  let id = req.params.townId;
  db.query(
    "SELECT town_no, town_name, town_zipcode, town_iscity from towns where town_no = ?",
    [id],
    (err, row) => {
      if (err) {
        throw err;
      } else {
        res.render("Admin/template", {
          user: req.user,
          row: row,
          pageTitle: "Town Panel",
          page: "Town/Update"
        });
      }
    }
  );
};

exports.towns_update = (req, res) => {
  date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  let data = {
    town: req.body.town_name,
    zipcode: req.body.zipcode,
    istown: req.body.city,
    id: req.params.townId
  };
  db.query(
    "UPDATE towns SET town_name=?, town_zipcode=?, town_iscity=?, town_encode=?, town_encode_date=? WHERE town_no=?",
    [data.town, data.zipcode, data.istown, user, date, data.id],
    (err, row) => {
      if (err) {
        throw err;
      } else {
        res.redirect("/admin/town");
      }
    }
  );
};

exports.towns_delete = (req, res) => {
  date = moment().format("YYYY-MM-DD HH:MM:SS");
  let user = req.user.user_no;
  db.query(
    "UPDATE towns SET town_delete=1, town_encode=?, town_encode_date=? where town_no=?",
    [user, date, req.params.townId],
    (err, row) => {
      if (err) {
        throw err;
      } else {
        res.redirect("/admin/town");
      }
    }
  );
};

const db = require("../../db.js");
let {
  tour_query,
  tour_fetch
} = require("./Helpers/QueryHelpers");

exports.tour = (req, res) => {
  let userDetail = req.user || '';
  res.render("Client/Tour", {
    pageTitle: "Tour",
    route: "tour",
    userDetail: userDetail
  });
};

exports.details = (req, res) => {
  let userDetail = req.user || '';
  let days = req.query.days || '';
  let numSelect;
  let firstWord = days.replace(/ .*/, '');

  if (firstWord == 'One') {
    numSelect = 1;
  } else if (firstWord == 'Two') {
    numSelect = 2;
  } else if (firstWord == 'Three') {
    numSelect = 3;
  }

  db.query(tour_query(), (err, rows) => {
    res.render("Client/Tour/details", {
      pageTitle: "Tour",
      days,
      rows,
      numSelect,
      route: "tour",
      userDetail: userDetail
    });
  });
}

exports.fetch_selected1 = (req, res) => {
  let attraction1 = req.params.attraction1 || '';

  if (attraction1 != '') {
    db.query(tour_fetch(attraction1), (err, result) => {
      if (err) { throw err; }
      res.send(JSON.stringify(result));
    });
  }
};

exports.fetch_selected2 = (req, res) => {
  let attraction2 = req.params.attraction2 || '';

  if (attraction2 != '') {
    db.query(tour_fetch(attraction2), (err, result) => {
      if (err) { throw err; }
      res.send(JSON.stringify(result));
    });
  }
};

exports.fetch_selected3 = (req, res) => {
  let attraction3 = req.params.attraction3 || '';

  if (attraction3 != '') {
    db.query(tour_fetch(attraction3), (err, result) => {
      if (err) { throw err; }
      res.send(JSON.stringify(result));
    });
  }
};
const mysql = require("mysql");
const db = require("../db.js");

exports.dashboard_get_all = (req, res) => {
  const { ut_no } = req.user;

  if (ut_no == 1)
    return res.redirect('/');

  res.render("Admin/template", {
    user: req.user,
    pageTitle: "Admin Panel",
    page: "Dashboard/Dashboard"
  });
};

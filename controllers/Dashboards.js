const mysql = require("mysql");
const db = require("../db.js");

exports.dashboard_get_all = (req, res) => {
  res.render("Admin/template", {
    user: req.user,
    pageTitle: "Admin Panel",
    page: "Dashboard/Dashboard"
  });
};

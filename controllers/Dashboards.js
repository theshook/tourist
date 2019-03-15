const db = require("../db.js");
const { log_file } = require("./Client/Helpers/QueryHelpers");
var moment = require("moment");

exports.dashboard_get_all = (req, res) => {
  const { ut_no } = req.user;

  if (ut_no == 1)
    return res.redirect('/');

  db.query(log_file(), (err, rows) => {
    if (err) { throw err; }

    return res.render("Admin/template", {
      user: req.user,
      rows,
      moment,
      pageTitle: "Admin Panel",
      page: "Dashboard/Dashboard",
      login_message: (req.flash('loginMessage').length == 0) ? '' : req.flash('loginMessage')
    });
  });
};

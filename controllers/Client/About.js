const db = require("../../db.js");
exports.about_us = (req, res) => {
  let userDetail = req.user || '';

  db.query(`SELECT ec_name FROM establistments_category UNION SELECT sc_name FROM spots_category`, (err, rows) => {
    if (err) throw err;
    res.render("Client/About", {
      pageTitle: "About Us",
      route: "about",
      rows,
      userDetail: userDetail
    });
  });

};
let moment = require("moment");
const db = require("../db.js");
let { notifications_estab, notifications_spots } = require("./Client/Helpers/QueryHelpers");
exports.notifs = (req, res) => {
  db.query(notifications_estab(), (estab_err, estab_rows) => {
    if (estab_err) { throw estab_err; }

    db.query(notifications_spots(), (spot_err, spot_rows) => {
      if (spot_err) { throw spot_err; }

      res.render("Admin/template", {
        user: req.user,
        estab_rows: estab_rows,
        spot_rows: spot_rows,
        moment: moment,
        pageTitle: "Notifications Panel",
        page: "Notifications/index"
      });
    });
  });
};

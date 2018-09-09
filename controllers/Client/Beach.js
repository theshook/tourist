const db = require("../../db.js");
const { spot_get_all_query, spot_get_single_query } = require('./Helpers/QueryHelpers');

exports.get_all_Beach = (req, res) => {
  db.query(
    spot_get_all_query(1),
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Beach", {
        rows: rows,
        pageTitle: "Beaches in Abra"
      });
    }
  );
};

exports.Beach_View = (req, res) => {
  let id = req.params.beach_id;
  db.query(
    spot_get_single_query(id),
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Beach/view", {
        rows: rows,
        pageTitle: "Beach Information"
      });
    }
  );
}

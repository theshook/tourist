const db = require("../../db.js");
const { spot_get_all_query, spot_get_single_query } = require('./Helpers/QueryHelpers');

exports.get_all_Island = (req, res) => {
  db.query(
    spot_get_all_query(3),
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Island", {
        rows: rows,
        pageTitle: "Island in Abra"
      });
    }
  );
};

exports.Island_View = (req, res) => {
  let id = req.params.island_id;
  db.query(
    spot_get_single_query(id),
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Island/view", {
        rows: rows,
        pageTitle: "Island Information"
      });
    }
  );
}

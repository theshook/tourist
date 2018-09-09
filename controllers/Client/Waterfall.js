const db = require("../../db.js");
const { spot_get_all_query, spot_get_single_query } = require('./Helpers/QueryHelpers');

exports.get_all_Waterfall = (req, res) => {
  db.query(
    spot_get_all_query(2),
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Waterfall", {
        rows: rows,
        pageTitle: "Waterfalls in Abra"
      });
    }
  );
};

exports.Waterfall_View = (req, res) => {
  let id = req.params.waterfall_id;
  db.query(
    spot_get_single_query(id),
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/Waterfall/view", {
        rows: rows,
        pageTitle: "Waterfall Information"
      });
    }
  );
}

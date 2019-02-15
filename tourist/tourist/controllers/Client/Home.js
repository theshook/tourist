const db = require("../../db.js");
const {
  top_destination_estab,
  top_destination_spot
} = require('./Helpers/QueryHelpers');

exports.get_all_Category = (req, res) => {
  let user = req.user || '';
  db.query(
    `SELECT ec_name FROM establistments_category
    UNION
    SELECT sc_name FROM spots_category`,
    (err, rows) => {
      if (err) {
        throw err;
      }
      
      db.query(top_destination_estab(), (error, top_estab) => {
        if (error) { throw error; }

        db.query(top_destination_spot(), (spot_error, top_spot) => {
          if (spot_error) { throw spot_error; }

          res.render("Client/", { 
            rows: rows, 
            pageTitle: "Abra Travel Guide",
            user:user,
            top_estab,
            top_spot
          });
        });
      });
    }
  );
};
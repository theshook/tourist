const db = require("../../db.js");

exports.get_all_Category = (req, res) => {
  console.log(req.connection.remoteAddress);
  db.query(
    `SELECT ec_name FROM establistments_category
    UNION
    SELECT sc_name FROM spots_category`,
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.render("Client/", { rows: rows, pageTitle: "Abra Travel Guide" });
    }
  );
};
